import {DateTime} from "luxon";

const orderHelpers = {
    renderFullOrder(obj, employee) {
        const o = fullOrderObjClear(obj);
        return `<h3>Общая информация</h3>
        <p>${o.name}</p>
        <p>Телефон: ${o.phone}</p>
        <p>С нами с ${o.visit}</p>
        <p>Платежей: ${o.payments}</p>
        <p>Средний чек: ${o.check}р</p>
        <p>Своих запчастей: ${o.ownParts}%</p>

        <h3>Бонусная программа</h3>
        <p>Доступно бонусов: ${o.bonus}</p>
        <p>Ближайшее сгорание: ${(o.burnSum) ? `${o.burnSum} бонусов ${o.burnDate}` : `-`}</p>

        <h3>Наличие запчастей</h3>
        <div class="partsList">
        ${createPartList(o.workList, employee)}
        </div>
        
        <h3>Обязательно предложить</h3>
        <label><input type="text" data-docregisid="${o.docRegId}" id="recommendation" value="${(o.offerText) ? `${o.offerText}` : ``}"></label>

        <div class="buttons" data-docplan="${o.docPlan}">
            <button id="save" class="btn-light">Сохранить</button>
            <button id="confirm" class="btn-light">Оформить</button>
        </div>`;
    }
}

function createPartList(arr, employee) {
    let str = ``;

    for (let i = 0; i < arr.length; i++) {

        const employeeList = createEmployeeOptions(employee, arr[i]['EMPLOYEE_ID']);
        const checked = (+arr[i]['VISIT_PREPARE_READY']) ? 'checked' : '';

        str += `<div class="item">
            <div class="workName">${arr[i]['NAME']}</div>
        <div class="input">
        <label><input type="checkbox" ${checked} id="${arr[i]['SERVICE_WORK_ID']}" class="workCheck" data-employee="${arr[i]['EMPLOYEE_ID']}" data-swid="${arr[i]['SERVICE_WORK_ID']}"/></label>
        </div>
        <div class="employee">
            <label>
                <select name="employee" id="${arr[i]['SERVICE_WORK_ID']}" data-swid="${arr[i]['SERVICE_WORK_ID']}" class="employeeSelect">
                    ${employeeList};
                </select>
            </label>
        </div>
    </div>`;
    }

    return str;
}

function createEmployeeOptions(arr, id) {
    let str = `<option value="null"></option>`;

    for (let i = 0; i < arr.length; i++) {
        const selected = (arr[i]['EMPLOYEE_ID'] === id) ? 'selected' : '';
        str += `<option ${selected} value="${arr[i]['EMPLOYEE_ID']}">${arr[i]['SHORTNAME']}</option>`;
    }

    return str;
}

function fullOrderObjClear(obj) {
    let burnDate = (obj.bonusFirstBurnDate) ? DateTime.fromISO(obj.bonusFirstBurnDate.delete_date).toFormat('dd.LL.yyyy') : null;
    let burnSum = (obj.bonusFirstBurnDate) ? toClearInt(obj.bonusFirstBurnDate.sum) : null;

    return {
        bonus: toClearInt(+obj.bonusBalance),
        burnDate: burnDate,
        burnSum: burnSum,
        name: obj.client['SHORTNAME'],
        phone: obj.contact['MOBILE'] || obj.contact['PHONE'],
        visit: obj.firstVisit,
        workList: obj.orderWorkList,
        ownParts: obj.ownPartPercent,
        payments: (obj.paymentSum) ? toClearInt(obj.paymentSum) : 0,
        fullNumber: obj.orderBaseInfo['FULLNUMBER'],
        docRegId: obj.orderBaseInfo['DOCUMENT_REGISTRY_ID'],
        offerText: obj.orderBaseInfo['OFFER'],
        bonusText: obj.orderBaseInfo['BONUS_INFO'],
        check: toClearInt(obj.middleCheck),
        docPlan: obj.docPlan

    };
}

function toClearInt(int) {
    int += '';
    int = int.replace('.', ',');
    if (int.indexOf(',') > 0) {
        let intArr = int.split(',');
        if (intArr[1].length === 1) {
            intArr[1] = intArr[1] + '0';
        }
        return forInt(intArr[0]) + ',' + intArr[1];
    } else {
        return forInt(int);
    }

    function forInt(realInt) {
        let a = [];
        let len;
        len = realInt.length;
        let j = 0;
        for (let i = len - 1; i >= 0; i--) {
            a.unshift(realInt[i]);
            j++;
            if (j === 3) {
                a.unshift(' ');
                j = 0;
            }
        }
        return a.join('');
    }
}

export {orderHelpers};