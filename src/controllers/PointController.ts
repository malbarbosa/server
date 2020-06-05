import {Response, Request} from "express";
import knex from "../database/connection";
class PointController{

    async index (request: Request, response: Response){
        const {city, uf, items} = request.query;

        const itemsConverted = String(items).split(',').map(item => Number(item.trim()));

        const selectPoints = await knex('points').join('point_items', 'points.id','point_items.point_id')
        .whereIn('point_items.item_id',itemsConverted)
        .where('points.city',String(city))
        .where('points.uf',String(uf))
        .select('points.*')
        .distinct();

        return response.status(200).json(selectPoints);
    }

    async show (request: Request, response: Response){
        const {id} = request.params;
        const point = await knex('points').where("id",id).first();
        if(!point){
            return response.status(404).json({message:"Point not found"});
        }
        const items = await knex('items').join('point_items', 'items.id','point_items.item_id')
        .where("point_items.point_id",id).select("items.title");

        return response.status(200).json({point,items});
    }

    async create (request: Request, response:Response){
        const {
            image
            ,name
            ,email
            ,whatsapp
            ,city
            ,uf
            ,logitude
            ,latitude
            ,items
            } = request.body;
        
            const trx = await knex.transaction();

            const point = { image: 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60'
                ,name
                ,email
                ,whatsapp
                ,city
                ,uf
                ,logitude
                ,latitude}
            
            const insertedIds = await trx('points').insert(point).then(result => {
                return result[0];
            })
            .catch(erro=>{
                response.send({message:"error 1 insert", erro:erro})
                
            });
            const point_id = insertedIds;
            const pointItems = items.map((item_id:Number) => {
                return {
                    point_id,
                    item_id  
                }
            });
            try{
                await trx('point_items').insert(pointItems);
                await trx.commit();
            }catch(error){
                trx.rollback();
                return response.json({message:"error", error:error});
            }
            return response.json({id:point_id, ...point})
    }
}

export default PointController;