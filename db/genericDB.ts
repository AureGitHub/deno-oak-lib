import { aureDB } from "../aureDB.ts";
import { statusError, statusOK } from "../status.ts";

export class GenericDB {

    private entity: any;

    constructor(entity: any) {
        this.entity = entity;
    }

    static async queryObject(client: any, sqlSelect: string){
        return await aureDB.queryObject(client, sqlSelect);
    }

    async get(ctx: any, client: any, sqlSelect: string, sqlFrom: string, orderBydefect: string) {
        await this.entity.execute_query(ctx, client, sqlSelect, sqlFrom, orderBydefect);
    };

    async getById(ctx: any) {
        const id = Number(ctx?.params?.id);
        const data = await this.entity.findFirst({ where: { id } });
        statusOK(ctx, data);

    };

    async add(ctx: any) {
        try {
            //const newItem = await ctx.request.body().value;
            const newItem = ctx.state.data;
            const data = await this.entity.create({ data: newItem });
            statusOK(ctx, {entity : data});
        } catch (error) {
            statusError(ctx, error);
            return;
        }
    };

    async update(ctx: any) {
        try {
            const id = Number(ctx?.params?.id);
            let itemUpdateInput = ctx.state.data;
            const data = await this.entity.update({ data: itemUpdateInput, where: { id } });

            if(!itemUpdateInput['id']){
                itemUpdateInput['id']=id;
            }

            statusOK(ctx, { rowCount: data?.rowCount, entity : itemUpdateInput });
        } catch (error) {
            statusError(ctx, error);
            return;
        }
    };

    async del(ctx: any) {
        try {
            const id = Number(ctx?.params?.id);
            const data = await this.entity.del({ where: { id } });
            statusOK(ctx, { rowCount: data?.rowCount, entity : {id} });
        } catch (error) {
            statusError(ctx, error);
            return;
        }
    };


}
