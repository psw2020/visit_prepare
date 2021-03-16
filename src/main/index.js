import VisitPrepare from './application';
import {checkForUpdates} from './updater'

new VisitPrepare();
setTimeout(() => {
    checkForUpdates()
}, 2000)