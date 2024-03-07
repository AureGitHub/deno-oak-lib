// deno-lint-ignore-file no-explicit-any

import { StatusCodes } from "../dep/deps.ts";



export class aureDB {
  private table: string;
  private entities : any;
  private client : any;
  
  constructor(client: any, entities : any, table: string) {
    this.table = table;
    this.entities = entities;
    this.client = client;

    if (!this.entities) {
      throw new Error(`configuración de entidades no existe`);
    }

    if (!this.entities[table]) {
      throw new Error(`La entidad ${table} no existe`);
    }

  }

  private getFilter(colums : any[]){
    let cadena =  `WHERE 1=1 `;
    colums.forEach(col => {
      if(col['filter']){
        cadena+=` and ${col.prop} like '%${col['filter']}%' `;
      }

      if(col['filterInit']){
        cadena+=` and ${col['filterInit']} `;
      }

    })
    
    return  cadena ;
  }


  private getOrderBy(colums : any[]){
    let cadena =  colums.some(a=>a.order || a.OrderInit)  ? 'order by ' : '';
    colums.forEach(col => {
      if(col['order']){
        cadena+=` ${col.prop} ${col['order']},`;
      }

      if(col['OrderInit']){
        cadena+=` ${col.prop} ${col['OrderInit']},`;
      }

    })
    return  cadena.substring(0,cadena.length-1) ;
  } 




  private validate(object: any) {
    const lstColums = this.entities[this.table];
    for (const pp in object) {
      if (pp == 'id') continue;
      const exits = lstColums.some(a => a['name'] == pp);
      if (!exits)
        throw new Error(`El campo ${pp} no pertenece a la tabla ${this.table}`);
    }
  }

  private propertiesToColumns(object: any){

    let sal = '';  
    for (const pp in object) {
      if (pp == 'createdAt' || pp == 'updatedAt') {
        sal += `"${pp}",`;
      }
      else {
        sal += pp + ",";
      }
  
    }

    sal = sal.substring(0, sal.length - 1);
    return sal;
  }

  private objecToValues (object: any){
    let sal = '';
  
    const lstColums = this.entities[this.table];
  
    for (const pp in object) {
  
      if (pp == 'id') {
        sal += `${object[pp]},`;
        continue;
      }
  
      const typeEntity = lstColums.find(a => a['name'] == pp);
  
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
  
  private objecToPropertieAndValues(object: any){
    let sal = '';
  
    const lstColums = this.entities[this.table];
  
    for (const pp in object) {
  
      if (pp == 'id') {
        sal += `${pp}=${object[pp]},`;
        continue;
      }
  
      const typeEntity = lstColums.find(a => a['name'] == pp);


      if (pp == 'createdAt' || pp == 'updatedAt') {
        sal += `"${pp}"=`;
      }
      else {
        sal += `${pp}=`;
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


  private async execute_sentence (str: string, tr: any){

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

  private getWhereStr(params : any){    
    if(!params || !params['where']) return '';
      this.validate(params['where']);   
      let str = this.objecToPropertieAndValues(params['where']);


      if(params['whereLstStr']){                  
        str+= ' , ' + params['whereLstStr'].toString();

      }


      str = str.replaceAll(',', ' and ');

      


      return  " WHERE " + str;
  }

  private getColumsSelectStr(params : any){
    if(!params || !params['colums']) return ' * ';
    if (params['colums']) {
      this.validate(params['colums']);
      return  this.propertiesToColumns(params['colums']);
    }

    return ' * ';
  }



  async execute_query_data(ctx: any, client: any, sqlSelect : string, sqlFrom :string, orderBydefect : string){
    let offset =0;
  let limit=0;
  let  count=0;
  let withCache = true;

  if(!ctx.state.objPagFilterOrder){
    ctx.state.objPagFilterOrder = {};
  ctx.state.objPagFilterOrder.pagination = {};
  ctx.state.objPagFilterOrder.pagination.withCache = false;
  ctx.state.objPagFilterOrder.pagination.limit = 10;
  ctx.state.objPagFilterOrder.pagination.offset=0;
  ctx.state.objPagFilterOrder.columns = [];
  ctx.state.objPagFilterOrder.mode = 'C';   // 'C' => Consulta    'P'=>Paginación
  offset *= limit;
  ctx.state.objPagFilterOrder.pagination.count =0;

  }

  if(ctx.state.objPagFilterOrder.pagination){
    withCache=ctx.state.objPagFilterOrder.pagination?.withCache;
    limit = ctx.state.objPagFilterOrder.pagination.limit;
    offset = ctx.state.objPagFilterOrder.pagination.offset;
    offset *= limit;
    count = ctx.state.objPagFilterOrder.pagination.count;
  }


  const columns = ctx.state.objPagFilterOrder.columns;
  const mode = ctx.state.objPagFilterOrder.mode;   // 'C' => Consulta    'P'=>Paginación



  const sqlSelectOnlyCount =` select  to_char(count(*), '9999999')  as total `;


  const strPrismaFilter = this.getFilter(columns);

  const strOrderBy = this.getOrderBy(columns);
  

    if(mode == 'C'){
    const result =  await client.queryObject(sqlSelectOnlyCount + sqlFrom + strPrismaFilter);   
    count = result &&  result.rows  &&  result.rows[0] && result.rows[0]['total'] ? parseInt(result.rows[0]['total']) : 0;
  }


  const sql_limit =withCache ? `` : `  offset ${offset} limit ${limit}`;

  const  order = strOrderBy ? strOrderBy : orderBydefect;


  
   const data = await client.queryObject(
    {
      camelcase: true,
      text: sqlSelect + sqlFrom + strPrismaFilter + order + sql_limit,
    }    
    );
    return {data, count};

  }


  async execute_query(ctx: any, client: any, sqlSelect : string, sqlFrom :string, orderBydefect : string){

    const result = await this.execute_query_data(ctx,client,sqlSelect,sqlFrom,orderBydefect);
   ctx.response.status = 201;
   ctx.response.body = {
     status: StatusCodes.OK,
     data: { data: result.data.rows, count: result.count },
   };

  }

  async findFirst(params: any) {

    if (!params['where']) {
      throw new Error(`La operación findFirst requiere de clausula where (entidad ${this.table})`);
    }

    const strValuesWhere = this.getWhereStr(params);
    const columsStr = this.getColumsSelectStr(params);
    const str = `SELECT  ${columsStr} from "${this.table}" ${strValuesWhere} `;
    const resutl = await this.execute_sentence(str, params?.tr);
    return resutl?.rows && resutl?.rows[0] ? resutl?.rows[0] : null;

  }


  async aggregate(params: any) {
    if (params['_max']) {
      const field = params['_max'];      
      const strValuesWhere = this.getWhereStr(params);
      const str = `SELECT  Max(${field}) from "${this.table}"  ${strValuesWhere} `;
      const resutl = await this.execute_sentence(str, params?.tr);
      return resutl && resutl.rows && resutl.rows[0] && resutl.rows[0]['max'] ? resutl.rows[0]['max'] : null;
    }

    else if (params['_count']) {
      const field = params['_count'];      
      const strValuesWhere = this.getWhereStr(params);
      const str = `SELECT  to_char(count(${field}), '9999999')  as total  from "${this.table}"  ${strValuesWhere} `;
      const resutl = await this.execute_sentence(str, params?.tr);
      return resutl && resutl.rows && resutl.rows[0] && resutl.rows[0]['total'] ? resutl.rows[0]['total'] : null;
    }
    
  }


  async findMany(params: any = null) {

    const  strValuesWhere = this.getWhereStr(params);
    const columsStr = this.getColumsSelectStr(params);
    
    const str = `SELECT  ${columsStr} from "${this.table}"   ${strValuesWhere} `;
    const resutl = await this.execute_sentence(str, params?.tr);
    return resutl?.rows  ? resutl?.rows : null;

  }


  async create(params: any) {

    if (!params['data']) {
      throw new Error(`La operación create requiere del objeto data (entidad ${this.table})`);
    }
    const data = params['data'];
    this.validate(data);  

    const updatedAt = this.entities[this.table].find(a=> a.name=='updatedAt');
    const createdAt = this.entities[this.table].find(a=> a.name=='createdAt');
    //if(updatedAt && !data['updatedAt']){
      if(updatedAt){ //siempre se crea desde el servidor
      data['updatedAt'] = new Date().toISOString();
    }
    if(createdAt){
      data['createdAt'] = new Date().toISOString();
    }



     
    const srtColums = this.propertiesToColumns(data);
    const strValues = this.objecToValues(data);
    const str = `INSERT INTO "${this.table}" (${srtColums}) VALUES (${strValues}) RETURNING *`;
    const resutl = await this.execute_sentence(str, params?.tr);
    return resutl?.rows && resutl?.rows[0] ? resutl?.rows[0] : null;
  }





  async update(params: any) {

    if (!params['data']) {
      throw new Error(`La operación create requiere del objeto data (entidad ${this.table})`);
    }

    const data = params['data'];
    this.validate(data);

    const updatedAt = this.entities[this.table].find(a=> a.name=='updatedAt');
    if(updatedAt){
      data['updatedAt'] = new Date().toISOString();
    }

    let str = `UPDATE "${this.table}" SET `;
    const strValues = this.objecToPropertieAndValues(data);
    str += strValues;

    const strValuesWhere = this.getWhereStr(params);
    str += strValuesWhere;
    const resutl = await this.execute_sentence(str, params?.tr);
    return resutl;
  }


  async del(params: any) {
    let str = `DELETE FROM "${this.table}" `;
    const strValuesWhere = this.getWhereStr(params);
    str += strValuesWhere;
    const resutl = await this.execute_sentence(str, params?.tr);
    return resutl;
  }
}
