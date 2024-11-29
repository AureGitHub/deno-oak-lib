// deno-lint-ignore-file no-explicit-any

import { StatusCodes } from "./deps.ts";

const lstEntityGenericNoObligatoria = [
  'public."Documentos"'
];


export class aureDB {
  private table: string;
  private entities: any;
  private client: any;
  private clientNoTransaction: any;

  
  constructor(client: any, clientNoTransaction: any, entities: any, table: string) {
    this.table = table;
    this.entities = entities;
    this.client = client;
    this.clientNoTransaction = clientNoTransaction;

    if (!this.entities) {
      throw new Error(`configuración de entidades no existe`);
    }

    if (!this.entities[table]) {
      const errStr =`La entidad ${table} no existe`;

      if(lstEntityGenericNoObligatoria.includes(table)){
        console.log('Atención...' + errStr);
      }
      else{
        throw new Error(errStr);
      }
    }

  }

  private getFilter(colums: any[]) {
    let cadena = `WHERE 1=1 `;
    colums.forEach(col => {
      if (col['filter']) {
        cadena += ` and ${col.prop} like '%${col['filter']}%' `;
      }

      if (col['filterInit']) {
        cadena += ` and ${col['filterInit']} `;
      }

    })

    return cadena;
  }


  private getOrderBy(colums: any[]) {
    let cadena = colums.some(a => a.order || a.OrderInit) ? 'order by ' : '';
    colums.forEach(col => {
      if (col['order']) {
        cadena += ` ${col.prop} ${col['order']},`;
      }

      if (col['OrderInit']) {
        cadena += ` ${col.prop} ${col['OrderInit']},`;
      }

    })
    return cadena.substring(0, cadena.length - 1);
  }




  private validate(object: any) {
    const lstColums = this.entities[this.table];
    for (const pp in object) {
      if (pp == 'id') continue;
      const exits = lstColums.some(a => a['name'] == pp);
      if (!exits) {
        // throw new Error(`El campo ${pp} no pertenece a la tabla ${this.table}`); Si no pertenece, paso del el mas abajo
      }

    }
  }

  private propertiesToColumns(object: any) {

    const lstColums = this.entities[this.table];
    let sal = '';
    for (const pp in object) {
      const entityType = lstColums.find(a=> a.name == pp);

      if (entityType) {        
        if(entityType.type == 'file' && !object[pp] ){
          continue;        
        }
        

        if (pp == 'createdAt' || pp == 'updatedAt') {
          sal += `"${pp}",`;
        }
        else {
          sal += pp + ",";
        }
      }
    }

    sal = sal.substring(0, sal.length - 1);
    return sal;
  }

  private objecToValues(srtColums: any, object: any) {
    let sal = '';

    const arrsrtColums = srtColums.split(',');
    const lstColums = this.entities[this.table];

    for (let i = 0; i < arrsrtColums.length; i++) {
      const pp = arrsrtColums[i].split('"').join(''); // le quito las "" para los createAt

      if (pp == 'id') {
        sal += `${object[pp]},`;
        continue;
      }

      const typeEntity = lstColums.find(a => a['name'] == pp);

      if (!typeEntity) {
        continue;  // el campo no pertenece a la tabla, paso de él
      }


      switch (typeEntity.type) {
        case 'text':
        case 'date':
        case 'password':
          sal += `'${object[pp]}',`;
          break;
        default:
          sal += `${object[pp]},`;
          break;
      }
    }
    sal = sal.substring(0, sal.length - 1);
    return sal;
  }

  private objecToPropertieAndValues(object: any) {
    let sal = '';

    const lstColums = this.entities[this.table];

    for (const pp in object) {

      if (pp == 'id') {
        sal += `${pp}=${object[pp]},`;
        continue;
      }

      const typeEntity = lstColums.find(a => a['name'] == pp);

      if (!typeEntity) {
        continue;
      }


      if (pp == 'createdAt' || pp == 'updatedAt') {
        sal += `"${pp}"=`;
      }
      else {
        sal += `${pp}=`;
      }


      switch (typeEntity.type) {

        case 'file':
          if (object[pp]) {
            sal += `'${object[pp]}',`;
          }
          else {
            sal += `null,`;
          }
          break;

        case 'text':

        case 'date':
        case 'password':

          sal += `'${object[pp]}',`;
          break;
        default:
          sal += `${object[pp]},`;
          break;
      }
    }
    sal = sal.substring(0, sal.length - 1);
    return sal;
  }


  private async execute_sentence(str: string, tr: any) {

    if (tr) {
      const data = await tr.queryObject(
        {
          camelcase: true,
          text: str,
        },
      );

      return data;
    }
    else {

      const data = await this.client.queryObject(
        {
          camelcase: true,
          text: str,
        }
      );

      return data;

    }


  }



  async execute_str(str: string) {
    const data = await this.client.queryObject(
      {
        camelcase: true,
        text: str,
      }
    );
    return data;
  }



  private getWhereStr(params: any) {
    if (!params || !params['where']) return '';
    this.validate(params['where']);
    let str = this.objecToPropertieAndValues(params['where']);


    if (params['whereLstStr']) {
      str += ' , ' + params['whereLstStr'].toString();

    }


    str = str.replaceAll(',', ' and ');




    return " WHERE " + str;
  }

  private getColumsSelectStr(params: any) {
    if (!params || !params['colums']) return ' * ';
    if (params['colums']) {
      this.validate(params['colums']);
      return this.propertiesToColumns(params['colums']);
    }

    return ' * ';
  }



  async execute_query_data(ctx: any, client: any, sqlSelect: string, sqlFrom: string, orderBydefect: string) {
    let offset = 0;
    let limit = 0;
    let count = 0;
    let withCache = true;

    if (!ctx.state.objPagFilterOrder) {
      ctx.state.objPagFilterOrder = {};
      ctx.state.objPagFilterOrder.pagination = {};
      ctx.state.objPagFilterOrder.pagination.withCache = true;
      ctx.state.objPagFilterOrder.pagination.limit = 10;
      ctx.state.objPagFilterOrder.pagination.offset = 0;
      ctx.state.objPagFilterOrder.columns = [];
      ctx.state.objPagFilterOrder.mode = 'C';   // 'C' => Consulta    'P'=>Paginación
      offset *= limit;
      ctx.state.objPagFilterOrder.pagination.count = 0;

    }

    if (ctx.state.objPagFilterOrder.pagination) {
      withCache = ctx.state.objPagFilterOrder.pagination?.withCache;
      limit = ctx.state.objPagFilterOrder.pagination.limit;
      offset = ctx.state.objPagFilterOrder.pagination.offset;
      offset *= limit;
      count = ctx.state.objPagFilterOrder.pagination.count;
    }


    const columns = ctx.state.objPagFilterOrder.columns;
    const mode = ctx.state.objPagFilterOrder.mode;   // 'C' => Consulta    'P'=>Paginación



    const sqlSelectOnlyCount = ` select  to_char(count(*), '9999999')  as total `;


    let strPrismaFilter = this.getFilter(columns);

    strPrismaFilter = sqlFrom.toLocaleLowerCase().includes('where') ? '' : strPrismaFilter;
    strPrismaFilter = sqlFrom.toLocaleLowerCase().includes('group') ? '' : strPrismaFilter;


    const strOrderBy = this.getOrderBy(columns);


    if (mode == 'C') {
      const result = await client.queryObject(

        {
          "camelCase": false,
          text: sqlSelectOnlyCount + sqlFrom + strPrismaFilter,
        }


      );
      count = result && result.rows && result.rows[0] && result.rows[0]['total'] ? parseInt(result.rows[0]['total']) : 0;
    }


    const sql_limit = withCache ? `` : `  offset ${offset} limit ${limit}`;

    const order = strOrderBy ? strOrderBy : orderBydefect;



    const data = await client.queryObject(
      {
        camelcase: true,
        text: sqlSelect + sqlFrom + strPrismaFilter + order + sql_limit,
      }
    );
    return { data, count };

  }


  async execute_query(ctx: any, client: any, sqlSelect: string, sqlFrom: string, orderBydefect: string) {

    const result = await this.execute_query_data(ctx, client, sqlSelect, sqlFrom, orderBydefect);
    ctx.response.status = 201;
    ctx.response.body = {
      status: StatusCodes.OK,
      data: { data: result.data.rows, count: result.count },
    };

  }

  static async queryObject(client: any, sqlSelect: string) {
    const result = await client.queryObject({"camelCase": false,text: sqlSelect});
    return result;
  }



  async findFirst(params: any) {

    if (!params['where']) {
      throw new Error(`La operación findFirst requiere de clausula where (entidad ${this.table})`);
    }

    const strValuesWhere = this.getWhereStr(params);
    const columsStr = this.getColumsSelectStr(params);
    const str = `SELECT  ${columsStr} from ${this.table} ${strValuesWhere} `;
    const resutl = await this.execute_sentence(str, params?.tr);
    return resutl?.rows && resutl?.rows[0] ? resutl?.rows[0] : null;

  }


  async aggregate(params: any) {
    if (params['_max']) {
      const field = params['_max'];
      const strValuesWhere = this.getWhereStr(params);
      const str = `SELECT  Max(${field}) from ${this.table}  ${strValuesWhere} `;
      console.log('aggregate ' + str); 
      const resutl = await this.execute_sentence(str, params?.tr);
      return resutl && resutl.rows && resutl.rows[0] && resutl.rows[0]['max'] ? resutl.rows[0]['max'] : null;
    }

    else if (params['_count']) {
      const field = params['_count'];
      const strValuesWhere = this.getWhereStr(params);
      const str = `SELECT  to_char(count(${field}), '9999999')  as total  from ${this.table}  ${strValuesWhere} `;
      const resutl = await this.execute_sentence(str, params?.tr);
      return resutl && resutl.rows && resutl.rows[0] && resutl.rows[0]['total'] ? resutl.rows[0]['total'] : null;
    }

    else if (params['_sum']) {
      const field = params['_sum'];
      const strValuesWhere = this.getWhereStr(params);
      const str = `SELECT  Sum(${field}) from ${this.table}  ${strValuesWhere} `;
      const resutl = await this.execute_sentence(str, params?.tr);
      return resutl && resutl.rows && resutl.rows[0] && resutl.rows[0]['sum'] ? resutl.rows[0]['sum'] : null;
    }

  }


  async findMany(params: any = null) {

    const strValuesWhere = this.getWhereStr(params);
    const columsStr = this.getColumsSelectStr(params);

    const str = `SELECT  ${columsStr} from ${this.table}   ${strValuesWhere} `;
    const resutl = await this.execute_sentence(str, params?.tr);
    return resutl?.rows ? resutl?.rows : null;

  }

  async gestionFile(data: any) {
    if (data['files'] && data['files'].length > 0) {
      for (let i = 0; i < data['files'].length; i++) {
        const objFile = data['files'][i];
        const fileInsert = await this.client.queryArray(
          'INSERT INTO public."Documentos" (filename, contenttype, "content") VALUES ($1, $2, $3)  RETURNING Id',
          [objFile['filename'], objFile['contenttype'], objFile['content']]
        );
        data[objFile['property']] = fileInsert.rows[0][0];
      }
    }
  }


  async create(params: any) {

    if (!params['data']) {
      throw new Error(`La operación create requiere del objeto data (entidad ${this.table})`);
    }
    const data = params['data'];
    this.validate(data);

    const updatedAt = this.entities[this.table].find(a => a.name == 'updatedAt');
    const createdAt = this.entities[this.table].find(a => a.name == 'createdAt');
    //if(updatedAt && !data['updatedAt']){
    if (updatedAt) { //siempre se crea desde el servidor
      data['updatedAt'] = new Date().toISOString();
    }
    if (createdAt) {
      data['createdAt'] = new Date().toISOString();
    }



    await this.gestionFile(data);

    const srtColums = this.propertiesToColumns(data);
    const strValues = this.objecToValues(srtColums, data);

    const str = `INSERT INTO ${this.table} (${srtColums}) VALUES (${strValues}) RETURNING *`;
    const resutl = await this.execute_sentence(str, params?.tr);
    return resutl?.rows && resutl?.rows[0] ? resutl?.rows[0] : null;
  }





  async update(params: any) {


    if (!params['data']) {
      throw new Error(`La operación create requiere del objeto data (entidad ${this.table})`);
    }

    const data = params['data'];
    const id = Number(params['where']['id']);

    this.validate(data);

    const updatedAt = this.entities[this.table].find(a => a.name == 'updatedAt');
    if (updatedAt) {
      data['updatedAt'] = new Date().toISOString();
    }


    const lstColumsTypeFile = this.entities[this.table].filter(a => a.type == 'file');

    lstColumsTypeFile.forEach(col => {
      if (data[col.name + '_oldId']) {
        //si se envía el _oldId, es porque se ha modificado o borrado
        //lo pongo a null... si hay nuevo file, this.gestionFile(data) se encargará de gestionarlo
        data[col.name] = null;
      }
    });



    await this.gestionFile(data);

    let str = `UPDATE ${this.table} SET `;
    const strValues = this.objecToPropertieAndValues(data);
    str += strValues;

    const strValuesWhere = this.getWhereStr(params);
    str += strValuesWhere;
    const resutl = await this.execute_sentence(str, params?.tr);



    //chequeo los documentos que tengo que borrar (ya no se usan)



    lstColumsTypeFile.forEach(async col => {
      if (data[col.name + '_oldId']) { 
        //si se envía el _oldId, es porque se ha modificado o borrado. Hay que borrar el  col.name + '_oldId'
        const fileInsert = await this.client.queryArray(
              'DELETE FROM public."Documentos" WHERE Id=$1',
              [data[col.name + '_oldId']]
            );
      }
    });



    return resutl;
  }


  async del(params: any) {

    const data = await this.findFirst(params);

    let str = `DELETE FROM ${this.table} `;
    const strValuesWhere = this.getWhereStr(params);
    str += strValuesWhere;
    const resutl = await this.execute_sentence(str, params?.tr);

    //borrar sus files (si los tuviese)
    const lstColumsTypeFile = this.entities[this.table].filter(a => a.type == 'file');
    lstColumsTypeFile.forEach(async col => {
      if(data[col.name]){
        const fileInsert = await this.client.queryArray(
          'DELETE FROM public."Documentos" WHERE Id=$1',
          [data[col.name]]
        );
      }
      
    });

    return resutl;
  }
}
