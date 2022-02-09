import {useContext, useEffect, useState} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';
import {AclRow} from "./AclRow";
import VCI from '../../../css/images/VCI_v4.png';
import {EdstContext} from "../../../contexts/contexts";
import {EdstTooltip} from "../../resources/EdstTooltip";
import {Tooltips} from "../../../tooltips";
import {EdstEntryType} from "../../../types";
import { useAppSelector } from '../../../redux/hooks';


export function AclTable() {
  const sortData = useAppSelector((state) => state.acl.sortData);
  const manualPosting = useAppSelector((state) => state.acl.manualPosting);

  const [any_holding, setAnyHolding] = useState(false);
  const [any_assigned_heading, setAnyAssignedHeading] = useState(false);
  const [any_assigned_speed, setAnyAssignedSpeed] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [alt_mouse_down, setAltMouseDown] = useState(false);
  const {
    entries,
    updateEntry,
  } = useContext(EdstContext);
  const cidList = useAppSelector(state => state.acl.cidList);

  // check whether any aircraft in the list is holding
  const checkHolding = () => {
    for (let cid of cidList) {
      if (entries[cid]?.hold_data) {
        setAnyHolding(true);
        return;
      }
    }
    setAnyHolding(false);
  };
  // check whether any aircraft in the list has an assigned heading or a speed
  // will display a * next to Hdg or Spd if the column is hidden, respectively
  const checkAssignedHdgSpd = () => {
    let any_hdg = false;
    let any_spd = false;
    for (let cid of cidList) {
      if (entries[cid]?.hdg || entries[cid]?.scratch_hdg) {
        any_hdg = true;
      }
      if (entries[cid]?.spd || entries[cid]?.scratch_spd) {
        any_spd = true;
      }
      if (any_spd && any_hdg) break;
    }
    setAnyAssignedHeading(any_hdg);
    setAnyAssignedSpeed(any_spd);
  };

  useEffect(() => {
    checkHolding();
    checkAssignedHdgSpd();
  });

  const toggleHideColumn = (name: string) => {
    let hidden_copy = hidden.slice(0);
    const index = hidden_copy.indexOf(name);
    if (index > -1) {
      hidden_copy.splice(index, 1);
    } else {
      hidden_copy.push(name);
    }
    setHidden(hidden_copy);
  };

  const handleClickSlash = () => {
    let hidden_copy = hidden.slice(0);
    if (hidden_copy.includes('spd') && hidden_copy.includes('hdg')) {
      hidden_copy.splice(hidden_copy.indexOf('spd'), 1);
      hidden_copy.splice(hidden_copy.indexOf('hdg'), 1);
    } else {
      if (!hidden_copy.includes('hdg')) {
        hidden_copy.push('hdg');
      }
      if (!hidden_copy.includes('spd')) {
        hidden_copy.push('spd');
      }
    }
    setHidden(hidden_copy);
  };

  const updateVci = (cid: string) => {
    const entry = entries[cid];
    if (entry?.vciStatus === -1 && manualPosting) {
      updateEntry(cid, {vciStatus: 0});
    } else {
      if (entry.vciStatus < 1) {
        updateEntry(cid, {vciStatus: 1});
      } else {
        updateEntry(cid, {vciStatus: 0});
      }
    }
  };

  const sortFunc = (u: EdstEntryType, v: EdstEntryType) => {
    switch (sortData.name) {
      case 'ACID':
        return u.callsign.localeCompare(v.callsign);
      case 'Destination':
        return u.dest.localeCompare(v.dest);
      case 'Origin':
        return u.dep.localeCompare(v.dep);
      case 'Boundary Time':
        return u.boundary_time - v.boundary_time;
      default:
        return u.callsign.localeCompare(v.callsign);
    }
  };

  const entry_list = Object.values(entries)?.filter((entry: EdstEntryType) => cidList.includes(entry.cid));
  const spa_entry_list = Object.entries(entry_list.filter((entry: EdstEntryType) => (typeof (entry.spa) === 'number'))
    ?.sort((u: any, v: any) => u.spa - v.spa));

  return (<div className="acl-body no-select">
    <div className="body-row header" key="acl-table-header">
      <div className="body-col radio-header green">
        <img src={VCI} alt="wifi-symbol"/>
      </div>
      <div className="body-col body-col-1 red">
        R
      </div>
      <div className="body-col body-col-1 yellow">
        Y
      </div>
      <div className="body-col body-col-1 orange">
        A
      </div>
      <div className="body-col body-col-1"/>
      <div className="inner-row">
        <div className="body-col fid">
          Flight ID
        </div>
        <EdstTooltip className="body-col pa header" title={Tooltips.aclHeaderPa} content="PA"/>
        <div className="body-col special special-hidden"/>
        <div className="body-col special special-hidden"/>
        <div className={`body-col type ${hidden.includes('type') ? 'hidden' : ''}`}>
          <div className="hover" onMouseDown={() => toggleHideColumn('type')}>
            T{!hidden.includes('type') && 'ype'}
          </div>
        </div>
        <div className="body-col alt header hover"
             onMouseDown={() => setAltMouseDown(true)}
             onMouseUp={() => setAltMouseDown(false)}
        >
          Alt.
        </div>
        <div className={`body-col code hover ${hidden.includes('code') ? 'hidden' : ''}`}
             onMouseDown={() => toggleHideColumn('code')}>
          C{!hidden.includes('code') && 'ode'}
        </div>
        <div className={`body-col special special-header`}/>
        <EdstTooltip title={Tooltips.aclHeaderHdg}>
          <div className={`body-col hs hdg hover ${hidden.includes('hdg') ? 'hidden' : ''}`}
               onMouseDown={() => toggleHideColumn('hdg')}>
            {hidden.includes('hdg') && any_assigned_heading && '*'}H{!hidden.includes('hdg') && 'dg'}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclHeaderSlash}>
          <div className="body-col hs-slash hover" onMouseDown={handleClickSlash}>
            /
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclHeaderSpd}>
          <div className={`body-col hs spd hover ${hidden.includes('spd') ? 'hidden' : ''}`}
               onMouseDown={() => toggleHideColumn('spd')}>
            S{!hidden.includes('spd') && 'pd'}{hidden.includes('spd') && any_assigned_speed && '*'}
          </div>
        </EdstTooltip>
        <div className={`body-col special special-header`}/>
        <div className={`body-col special special-header`}/>
        <div className={`body-col special special-header`} // @ts-ignore
             disabled={!any_holding}>
          H
        </div>
        <div className={`body-col special special-header`}/>
        <div className={`body-col special special-header`}/>
        <div className="body-col route">
          Route
        </div>
      </div>
    </div>
    <div className="scroll-container">
      {spa_entry_list?.map(([i, entry]: [string, EdstEntryType]) =>
        <AclRow
          key={`acl-table-row-spa-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}
          anyHolding={any_holding}
          hidden={hidden}
          altMouseDown={alt_mouse_down}
          updateVci={updateVci}
        />)}
      {spa_entry_list.length > 0 && <div className="body-row separator"/>}
      {Object.entries(entry_list?.filter((entry: EdstEntryType) => (!(typeof (entry.spa) === 'number') && ((entry.vciStatus > -1) || !manualPosting)))
        ?.sort(sortFunc))?.map(([i, entry]: [string, EdstEntryType]) =>
        <AclRow
          key={`acl-table-row-ack-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}
          anyHolding={any_holding}
          hidden={hidden}
          altMouseDown={alt_mouse_down}
          updateVci={updateVci}
        />)}
      {manualPosting && <div className="body-row separator"/>}
      {manualPosting && Object.entries(entry_list?.filter((entry: EdstEntryType) => (!(typeof (entry.spa) === 'number') && cidList.includes(entry.cid) && entry.vciStatus === -1)))
        ?.map(([i, entry]: [string, EdstEntryType]) =>
          <AclRow
            key={`acl-table-row-no-ack-${entry.cid}-${i}`}
            index={Number(i)}
            entry={entry}
            anyHolding={any_holding}
            hidden={hidden}
            altMouseDown={alt_mouse_down}
            updateVci={updateVci}
          />)}
    </div>
  </div>);
}
