import {DateTime} from "luxon";
import {ipcRenderer} from 'electron';

const taskListHelpers = {

    createTaskList(obj) {
        const arr = taskListObjClear(obj);
        let str = `<div class="taskListWrapper">`;

        arr.forEach(v => {

            let notes = (v.notes) ? v.notes.substr(0, 30) + '&hellip;' : '---';
            let cl = (v.docid && v.clid) ? '' : 'disabled';
            let complete = (+v.taskMark === 11) ? 'complete' : '';

            if (v.difference > 0 && v.difference < 60) {
                taskNotify(`${v.date.substr(6,5)} истекает время подготовки к визиту!`,v.notes);
            }

            str += `
          <div title="${v.notes || ``}" class="taskListItem ${cl} ${complete}" data-complete="${complete}" data-docid="${v.docid}" data-clid="${v.clid}" data-contact="${v.contact}" data-docplid="${v.docplid}">
            <p class="date">${v.date}</p>
            <p class="model">${(v.mark) ? `${v.mark} ${v.model}` : `${notes}`}</p>
            <p class="gosnumber">${(v.regno) ? `${v.regno}` : `---`}</p>
            </div>`;
        });

        return str + '</div>';
    },


}

function taskListObjClear(arr) {
    let a = [];
    const dateNow = new Date();
    arr.forEach(v => {
        let {
            DOCUMENT_PLANNING_ID: docplid,
            DATE_START: date,
            DOCUMENT_OUT_ID: docid,
            MARK: mark,
            MODEL: model,
            REGNO: regno,
            CLIENT_ID: clid,
            CLIENT_CONTACT_ID: contact,
            DP_MARK: taskMark,
            NOTES: notes
        } = v;

        let difference = (Math.round((new Date(date) - dateNow) / 1000 / 60));
        let dateFormat = DateTime.fromFormat(date, 'yyyy-MM-dd HH:mm:ss').toFormat('dd.MM HH:mm');
        a.push({date: dateFormat, docid, mark, model, regno, clid, contact, docplid, taskMark, notes, difference});
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