import {DateTime} from "luxon";

const orderHelpers = {
    taskListObjClear(arr) {
        let a = [];
        arr.forEach(v => {
            let {
                DOCUMENT_PLANNING_ID: docplid,
                DATE_START: date,
                DOCUMENT_OUT_ID: docid,
                MARK: mark,
                MODEL: model,
                REGNO: regno,
                CLIENT_ID: clid,
                CLIENT_CONTACT_ID: contact
            } = v;
            let dateFormat = DateTime.fromISO(date).toFormat('dd.LL HH:mm');
            a.push({date: dateFormat, docid, mark, model, regno, clid, contact, docplid});
        });
        return a;
    },

    renderFullOrder(obj, employee) {
        const o = fullOrderObjClear(obj);
        return `<h3>Общая информация</h3>
        <p>${o.name}</p>
        <p>Телефон: ${o.phone}</p>
        <p>С нами с ${o.visit}</p>
        <p>Средний чек: ${o.check}р</p>
        <p>Своих запчастей: ${o.ownParts}%</p>

        <h3>Бонусная программа</h3>
        <p>Доступно бонусов: ${o.bonus}</p>
        <p>Ближайшее сгорание: ${o.burnSum} бонусов ${o.burnDate}</p>

        <h3>Наличие запчастей</h3>
        <div class="partsList">
        ${createPartList(o.workList, employee)}
        </div>
        <h3>Обязательно предложить</h3>
        <label><input type="text" id="recommendation" value="${o.offerText}"></label>

        <div class="buttons">
            <button class="btn-light">Сохранить</button>
            <button class="btn-light">Оформить</button>
        </div>`;
    }
}

function createPartList(arr, employee) {
    let str = ``;
    const employeeList = createEmployeeOptions(employee);
    for (let i = 0; i < arr.length; i++) {
        str += `   <div class="item">
        <div class="workName">${arr[i]['NAME']}</div>
        <div class="input"><label><input type="checkbox" data-employee="${arr[i]['EMPLOYEE_ID']}" data-swid="${arr[i]['SERVICE_WORK_ID']}"/></label></div>
        <div class="employee">
            <label>
                <select name="employee" id="">
                    ${employeeList};
                </select>
            </label>
        </div>
    </div>`;
    }

    return str;
}

function createEmployeeOptions(arr) {
    let str = ``;

    for (let i = 0; i < arr.length; i++) {
        str += `<option value="${arr[i]['EMPLOYEE_ID']}">${arr[i]['SHORTNAME']}</option>`;
    }

    return str;
}

function fullOrderObjClear(obj) {
    return {
        bonus: toClearInt(obj.bonusBalance),
        burnDate: DateTime.fromISO(obj.bonusFirstBurnDate.delete_date).toFormat('dd.LL.yyyy'),
        burnSum: toClearInt(obj.bonusFirstBurnDate.sum),
        name: obj.client['SHORTNAME'],
        phone: obj.contact['MOBILE'] || obj.contact['PHONE'],
        visit: obj.firstVisit,
        workList: obj.orderWorkList,
        ownParts: obj.ownPartPercent,
        payments: toClearInt(obj.paymentSum),
        fullNumber: obj.orderBaseInfo['FULLNUMBER'],
        docRegId: obj.orderBaseInfo['DOCUMENT_REGISTRY_ID'],
        offerText: obj.orderBaseInfo['OFFER'],
        bonusText: obj.orderBaseInfo['BONUS_INFO'],
        check: toClearInt(obj.middleCheck)

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