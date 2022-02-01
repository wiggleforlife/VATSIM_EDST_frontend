import {FunctionComponent, useContext, useRef, useState,} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {EdstButton} from "../resources/EdstButton";
import {EdstWindowProps} from "../../interfaces";

export const CancelHoldMenu: FunctionComponent<EdstWindowProps> = ({pos, asel, closeWindow}) => {
  const {
    edst_data,
    startDrag,
    stopDrag,
    amendEntry,
    updateEntry
  } = useContext(EdstContext);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  const entry = edst_data[asel.cid];

  return (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu cancel-hold no-select"
      ref={ref}
      id="cancel-hold-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref)}
           onMouseUp={(event) => stopDrag(event)}
      >
        Cancel Hold Confirmation
      </div>
      <div className="options-body">
        <div className="options-row fid">
          {entry.callsign} {entry.type}/{entry.equipment}
        </div>
        <div className="options-row">
          <div className="options-col left">
            <EdstButton content="Cancel Hold" onMouseDown={() => {
              amendEntry(entry.cid, {hold_data: null});
              updateEntry(entry.cid, {show_hold_info: false});
              closeWindow();
            }}/>
          </div>
          <div className="options-col right">
            <EdstButton content="Exit" onMouseDown={closeWindow}/>
          </div>
        </div>
      </div>
    </div>
  );
}