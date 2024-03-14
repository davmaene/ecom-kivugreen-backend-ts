import * as controler from '../../controller'
import { Router } from 'express'

export default (router: Router) => {
    router.post('/action/add', controler.action.createAction);
    router.get('/action', controler.action.findAllAction);
    router.delete('/action/delete', controler.action.deleteAction);
    router.patch('/action/update', controler.action.updateAction);
}