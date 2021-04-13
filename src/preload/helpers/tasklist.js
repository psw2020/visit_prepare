import {DateTime} from "luxon";
import {ipcRenderer} from 'electron';

const taskListHelpers = {

    createTaskList(obj) {
        const arr = taskListObjClear(obj);
        let str = `<div class="taskListWrapper">`;
        arr.forEach(v => {

            if (v.differenceToOder < 0) return; //если задание просрочено не обрабатывать его

            let notes = (v.notes) ? v.notes.substr(0, 29) + '&hellip;' : '---';
            let cl = (v.docid && v.clid) ? '' : 'disabled';
            let complete = (+v.taskMark === 11) ? 'complete' : '';
            let exploited = '';


            if (v.isToday && v.differenceFromCreate > 60) { //с момента создания задания больше часа, до приезда еще есть время
                exploited = 'exploited';
            }

            makeNotify(v); //выкинуть уведомления, если надо

            str += `
          <div title="${v.notes || ``}" class="taskListItem ${cl} ${complete} ${exploited}" data-complete="${complete}" data-docid="${v.docid}" data-clid="${v.clid}" data-contact="${v.contact}" data-docplid="${v.docplid}">
            <p class="date">${v.date}</p>
            <p class="model">${(v.mark) ? `${v.mark} ${v.model}` : `${notes}`}</p>
            <p class="gosnumber">${(v.regno) ? `${v.regno}` : `---`}</p>
            </div>`;
        });

        return str + '</div>';
    },


}

function makeNotify(v) { //Всплывающие уведомления
    const hour = new Date().getHours();
    let notesForNotify = (v.notes) ? v.notes : '---';


    if (v.isToday && v.differenceFromCreate < 60) { //если задание на сегодня, но с откытия не прошёл час (мастерам дается 1 час на обработку с момента создания)
        taskNotify(`На обработку задания осталось ${60 - v.differenceFromCreate} мин.`, notesForNotify);
    } else if (v.isToday && v.differenceFromCreate > 60) { //если задание на сегодня и открыто больше часа назад
        cache.hasExploitedTask = true; //переключить в кеше признак просроченного задания
        taskNotify('Просрочено время на обработку задания!', notesForNotify);
    } else if (v.differenceToOder > 0 && v.differenceToOder < 60) { //Выкинуть уведомление, если до приезда осталось менее часа
        taskNotify(`${v.date.substr(6, 5)} истекает время подготовки к визиту!`, notesForNotify);
    } else if (!v.isToday && hour > 18) { //если время больше 19:00 и задание на завтра
        taskNotify(`Необходимо обработать задание на завтра`, notesForNotify);
    }
}

function taskListObjClear(arr) {
    let a = [];
    const dateNow = new Date();
    arr.forEach(v => {
        let {
            DOCUMENT_PLANNING_ID: docplid,
            DATE_START: date,
            DATE_CREATE: dateCreate,
            DOCUMENT_OUT_ID: docid,
            MARK: mark,
            MODEL: model,
            REGNO: regno,
            CLIENT_ID: clid,
            CLIENT_CONTACT_ID: contact,
            DP_MARK: taskMark,
            NOTES: notes
        } = v;
        let isToday = false;
        let differenceToOder = (Math.round((new Date(date) - dateNow) / 1000 / 60)); //сколько минут осталось до начала задания
        let differenceFromCreate = (Math.round((dateNow - new Date(dateCreate)) / 1000 / 60)); //сколько минут прошло с момента создания задания
        let dateFormat = DateTime.fromFormat(date, 'yyyy-MM-dd HH:mm:ss').toFormat('dd.MM HH:mm');
        if (dateNow.getDay() === new Date(date).getDay()) {
            isToday = true;
        }
        a.push({
            date: dateFormat,
            docid,
            mark,
            model,
            regno,
            clid,
            contact,
            docplid,
            taskMark,
            notes,
            differenceToOder,
            differenceFromCreate,
            isToday
        });
    });
    return a;
}

function taskNotify(title, body) {
    const not = new Notification(title, {body: body});
    not.onclick = () => {
        ipcRenderer.send('showWindow');
    }
}


export {taskListHelpers};