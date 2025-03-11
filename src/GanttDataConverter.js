import { getRouteColor } from './color';

export const convertToInput = async function(_input) {

    const routeIdToVhclId = {};
    const routeIdToStopRcnt = {};
    const routeIdToRowIndex = {};

    for (const [index, row] of _input.filteredRouteList.entries()) {
        const {routeId, stopRcnt, vhclId} = row;
        routeIdToVhclId[routeId] = vhclId;
        routeIdToStopRcnt[routeId] = stopRcnt;
        routeIdToRowIndex[routeId] = index;
    }

    const ganttInfoArray = [];
    const popupInfo = {}

    const markerId = [];
    _input.filteredRouteDetailList.forEach(routeDetailRow => {
        const {routeId, vhclId, stopSeqNo, order, arrDtm, depDetm, taskPeridVal} = routeDetailRow;

        const id = `${vhclId}-${stopSeqNo}`;
        markerId.push(id);
        const label = stopSeqNo;
        const  startTime = new Date(arrDtm).getTime();
        const duration = taskPeridVal > 0? taskPeridVal : 600;
        const type = 'task';
        const row = routeIdToRowIndex[routeId];
        const dependentOn = []
        if (parseInt(stopSeqNo) > 0) {
            const prevStopSeqNo = parseInt(stopSeqNo) - 1;
            const prevId = `${vhclId}-${prevStopSeqNo}`;
            if (markerId.includes(prevId)) {
                dependentOn.push(prevId);
            }
        }


        const colorHexCode = getRouteColor(row) || '#FFFFFF';
        const style = {
            base : {
                fill: colorHexCode,
            }
        }

        const ganttInfo = {
            id, label, startTime, duration, type, row, dependentOn, style
        }

        ganttInfoArray.push(ganttInfo);

       
        const {
            taskStatDtm, zoneId, locId, locNm, lat, lon, loadWt, loadVol, loadWtUnitCd, loadVolUnitCd, custOpenTime, custCloseTime, regionCd, regionNm
        } = routeDetailRow;

        popupInfo[id] = {
            order, depDetm, arrDtm, taskStatDtm, zoneId, locId, locNm, lat, lon, loadWt, loadVol, loadWtUnitCd, loadVolUnitCd, custOpenTime, custCloseTime, regionCd, regionNm
        }
        
    })


    return [ganttInfoArray, popupInfo];
    

    

}
