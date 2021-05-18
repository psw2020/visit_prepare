import Api from "../../main/application/api";

const api = new Api();

const adwSetupInterface = {
    async loadInterface(id, name) {
        const mileages = [15000, 30000, 60000, 90000, 105000];
        const meta = await api.get(`visitPrepare/meta?id=${id}`);
        const allWorksList = await getAllWorksList();
        const table = createTable(mileages, allWorksList, name);
        return {html: table, meta, modelId: id};
    }
}

async function getAllWorksList() {
    return await api.get(`visitPrepare/allWorksList`);
}

function createTable(mileageArr, workList, name) {
    let str = `<h3>${name}</h3><table class="adwTable table"><tr>`;
    str += `<td></td>`;
    mileageArr.forEach(v => str += `<td>${v}</td>`);
    str += `</tr>`;

    for (let i = 0; i < workList.length; i++) {
        str += `<tr><td>${workList[i]['NAME']}</td>`;
        mileageArr.forEach(v => {
            const id = workList[i]['ID'] + 'm' + v; //id чекбокса, может и выглядит не айс, зато производительно
            str += `<td><input type="checkbox" id="${id}" data-workId="${workList[i]['ID']}" data-mileage="${v}"></td>`;
        });

    }

    str += `</tr></table>`;
    return str += `<div class="adwButtons"><button id="saveAdwTable">Сохранить</button> <button id="closeAdwTable">Закрыть</button></div>`;
}

export {adwSetupInterface}