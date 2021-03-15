import {DateTime} from "luxon";

const taskListHelpers = {

    createTaskList(obj) {
        const arr = taskListObjClear(obj);
        let str = '';

        arr.forEach(v => {
            let notes = (v.notes) ? v.notes.substr(0, 40) + '&hellip;' : null;
            let cl = (v.docid && v.clid) ? '' : 'disabled';
            let complete = (+v.taskMark === 11) ? 'complete' : '';
            str += `
          <div class="taskListItem ${cl} ${complete}" data-complete="${complete}" data-docid="${v.docid}" data-clid="${v.clid}" data-contact="${v.contact}" data-docplid="${v.docplid}">
            <p class="date">${v.date}</p>
            <p class="model">${(v.mark) ? `${v.mark} ${v.model}` : `${notes}`}</p>
            <p class="gosnumber">${(v.regno) ? `${v.regno}` : `---`}</p>
            </div>`;
        });

        return str;
    },


}

function taskListObjClear(arr) {
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
            CLIENT_CONTACT_ID: contact,
            DP_MARK: taskMark,
            NOTES: notes
        } = v;
        let dateFormat = DateTime.fromFormat(date, 'yyyy-MM-dd HH:mm:ss').toFormat('dd.MM HH:mm');
        a.push({date: dateFormat, docid, mark, model, regno, clid, contact, docplid, taskMark, notes});
    });
    return a;
}

export {taskListHelpers};