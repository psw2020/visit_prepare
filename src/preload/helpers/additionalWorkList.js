import Api from "../../main/application/api";

const api = new Api();

const addWorks = {
    async getWorkList(model, mileage) {
        if (!mileage) {
            newMessage(`В заказ наряде не указан пробег, не удается загрузить список рекомендованных работ`, 'warning');
            return false;
        }

        const clearModel = model.split(' ')[0].toLowerCase();
        const modelId = await findModelId(clearModel);

        if (!modelId) {
            newMessage(`Модель ${model} не найдена, не удается загрузить список рекомендованных работ`, 'warning');
            header.remove();
            return false;
        }

        const mileageArr = await uniqueRanges(modelId);
        const suitableMileageArr = await suitableMileage(mileage, mileageArr);
        const suitableWorksId = await suitableWorks(modelId, suitableMileageArr);
        return await workList(suitableWorksId);
    },
    test(str) {
        return uniqueRanges(str);
    }
}

function toPositive(int) {
    return (int < 0) ? int * -1 : int;
}

function suitableMileage(factMileage, mileageArr) {
    let differenceArr = [];
    let cache = [];

    for (let i = 0; i < mileageArr.length; i++) {
        const constMileage = mileageArr[i];
        const division = Math.round(+(factMileage / constMileage).toFixed(3));

        if (!division) {
            continue;
        }

        const nearestMileage = constMileage * division;
        const difference = toPositive(nearestMileage - factMileage);
        cache.push({constMileage, difference});
        differenceArr.push(difference);
    }

    return cache.filter(v => v.difference === Math.min(...differenceArr)).map(v => v.constMileage);
}

async function findModelId(model) { //Поиск ID модели по названию
    const id = await api.get(`visitPrepare/findModelId?model=${model}`);
    return (id.length) ? id[0]['id'] : null;
}

async function uniqueRanges(id) { //Возвращает массив возможных интервалов работ
    const arr = await api.get(`visitPrepare/uniqueRanges?id=${id}`);
    return arr.map(v => v['mileage']);
}

async function workList(workArr) {
    return await api.get(`visitPrepare/workList?id=${workArr.join()}`);
}

async function suitableWorks(modelId, mileageArr) { //список работ подходящих по пробегу
    const arr = await api.get(`visitPrepare/suitableWorks?id=${modelId}&mileage=${mileageArr.join()}`);
    return arr.map(v => v['work_id']);
}

export {addWorks};