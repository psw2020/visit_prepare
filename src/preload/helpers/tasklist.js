import {DateTime} from "luxon";

const taskListHelpers = {

    createTaskList(obj) {
        const arr = taskListObjClear(obj);
        let str = '';

        arr.forEach(v => {
            let cl = (v.docid) ? '' : 'disabled';
            let complete = (+v.taskMark === 11) ? 'complete' : '';
            str += `
          <div class="taskListItem ${cl} ${complete}" data-complete="${complete}" data-docid="${v.docid}" data-clid="${v.clid}" data-contact="${v.contact}" data-docplid="${v.docplid}">
            <p class="date">${v.date}</p>
            <p class="model">${v.mark} ${v.model}</p>
            <p class="gosnumber">${v.regno}</p>
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
            DP_MARK: taskMark
        } = v;
        let dateFormat = DateTime.fromISO(date).toFormat('dd.LL HH:mm');
        a.push({date: dateFormat, docid, mark, model, regno, clid, contact, docplid, taskMark});
    });
    return a;
}

export {taskListHelpers};