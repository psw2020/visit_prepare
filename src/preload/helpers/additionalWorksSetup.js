import Api from "../../main/application/api";
import {adwSetupInterface} from "./adwSetupInterface";

const api = new Api();

const adws = {
    async createMenuObj(handler) {
        let marks = await getMarkList();
        const models = await getModelList();
        models.forEach(v => {
            marks[v.mark]['models'].push({id: v.id, name: v.name});
        });

        let menuObj = [];

        for (let k in marks) {
            let submenu = [];
            marks[k].models.forEach(v => {
                submenu.push({
                    label: v.name,
                    click() {
                        adwSetupInterface.loadInterface(v.id, v.name).then(res => {
                            handler(res);
                        }, rej => console.log(rej));
                    }
                });
            })

            menuObj.push({
                label: marks[k].name,
                submenu: submenu
            })
        }

        return menuObj;

    },

    async saveMetadata(id, meta) {
        await api.delete(`visitPrepare/deleteMetadata?id=${id}`); //удаляем все старые комбинации работа / модель / пробег по id модели
        meta.forEach(async (v) => {
            await api.post('visitPrepare/insertMeta', {modelId: id, workId: v.workId, mileage: v.mileage});
        });
    }
}

async function getMarkList() {
    const data = await api.get(`visitPrepare/markList`);
    let obj = {};
    data.forEach(v => {
        obj[v.id] = {name: v.name, models: []}
    });
    return obj;
}

async function getModelList() {
    return await api.get(`visitPrepare/modelList`);
}


export {adws};