import  knex from '../database/connection';
import { Response, Request } from 'express';

class ItemsController {
    async index(request: Request, response: Response){
        const items = await knex('items').select("*");

        const serializedItems = items.map(item =>
            {return {...item, image:`http://localhost:3333/uploads/${item.image}`};
        });
        
        return response.json(serializedItems);
    }
}

export default ItemsController;