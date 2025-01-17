import {useContext, useEffect, useState} from 'react';
import _ from 'lodash';
import '../../css/header-styles.scss';
import '../../css/windows/alt-menu-styles.scss';
import {EdstContext} from "../../contexts/contexts";

export function AltMenu(props) {
  const {
    edst_data,
    asel,
    trialPlan,
    amendEntry,
    setInputFocused
  } = useContext(EdstContext);
  const {pos} = props;
  const [dep, setDep] = useState(asel.window === 'dep');
  const [selected, setSelected] = useState(asel.window !== 'dep' ? 'trial' : 'amend');
  const [temp_alt_hover, setTempAltHover] = useState(null);
  const [deltaY, setDeltaY] = useState(0);
  const [manual_input, setManualInput] = useState(null);
  const [show_invalid, setShowInvalid] = useState(false);
  const entry = edst_data[asel.cid];

  useEffect(() => {
    setDep(asel.window === 'dep');
    setSelected(asel.window !== 'dep' ? 'trial' : 'amend');
    setTempAltHover(null);
    setDeltaY(0);
  }, [asel]);

  const handleAltClick = (alt) => {
    if (selected === 'amend') {
      amendEntry(entry.cid, {altitude: alt})
    } else {
      const trial_plan = {
        cid: entry.cid, callsign: entry.callsign, plan_data: {
          altitude: alt,
          interim: null
        },
        msg: `AM ${entry.cid} ALT ${alt}`
      };
      trialPlan(trial_plan);
    }
    props.closeWindow();
  }

  const handleTempAltClick = (alt) => {
    if (selected === 'amend') {
      amendEntry(entry?.cid, {interim: alt})
    } else {
      const trial_plan = {
        cid: entry.cid, callsign: entry.callsign, plan_data: {
          interim: alt
        },
        msg: `QQ /TT ${alt} ${entry?.cid}`
      };
      trialPlan(trial_plan);
    }
    props.closeWindow();
  }

  const handleScroll = (e) => {
    const new_deltaY = Math.min(Math.max((Number(entry.altitude) - 560) * 10, deltaY + e.deltaY), (Number(entry.altitude) - 40) * 10);
    setDeltaY(new_deltaY);
  }

  const handleKeyDown = () => {
    if (manual_input === null) {
      setManualInput('');
      setInputFocused(true);
      // setSelected('trial');
    }
  }

  return (<div
      className={`alt-menu no-select ${manual_input !== null ? 'manual-input' : ''}`}
      id="alt-menu"
      tabIndex="0"
      style={{left: pos.x, top: pos.y}}
      onKeyDown={handleKeyDown}
    >
      <div className={`alt-menu-header no-select`}
      >
        <div className="alt-menu-header-left">
          {entry?.callsign}
        </div>
        <div className="alt-menu-header-right"
             onMouseDown={props.closeWindow}
        >
          X
        </div>
      </div>
      {manual_input !== null ? <span>
        <div className="alt-menu-row">
        FP{entry.altitude}
      </div>
        <div className="alt-menu-row input-container">
          <input value={manual_input}
                 onChange={(event) => setManualInput(event.target.value.toUpperCase())}
                 onKeyDown={(event) => {
                   if (event.key === 'Enter') {
                     // check if input is number and length matches valid input
                     if (!isNaN(manual_input) && manual_input.length === 3) {
                       handleAltClick(manual_input);
                     } else {
                       setShowInvalid(true);
                     }
                   }
                 }}
                 onFocus={() => setInputFocused(true)}
                 // onBlur={() => setInputFocused(false)}
          />
        </div>
        {show_invalid && <div className="alt-menu-row invalid-input">
          INVALID
        </div>}
      </span> : <span>
        <div className={`alt-menu-row hover ${selected === 'trial' ? 'selected' : ''}`}
             onMouseDown={() => setSelected('trial')}
             disabled={dep}
        >
        TRIAL PLAN
      </div>
      <div className={`alt-menu-row hover ${selected === 'amend' ? 'selected' : ''}`}
           onMouseDown={() => setSelected('amend')}
      >
        AMEND
      </div>
      <div className={`alt-menu-row`} disabled={true}>
        {!dep ? 'PROCEDURE' : 'NO ALT'}
      </div>
      <div className="alt-menu-select-container"
           onWheel={handleScroll}
      >
        {_.range(30, -40, -10).map(i => {
          const alt = Number(entry.altitude) - (deltaY / 100 | 0) * 10 + i;
          return <div
            className={`alt-menu-container-row ${((selected === 'amend') && (temp_alt_hover === alt)) ? 'temp-alt-hover' : ''}`}
            key={`alt-${i}`}
          >
            <div className={`alt-menu-container-col ${alt === Number(entry.altitude) ? 'selected' : ''}`}
                 onMouseDown={() => handleAltClick(alt)}
            >
              {String(alt).padStart(3, '0')}
            </div>
            {!dep &&
            <div className={`alt-menu-container-col-t`}
                 disabled={!(selected === 'amend')}
                 onMouseEnter={() => (selected === 'amend') && setTempAltHover(alt)}
                 onMouseLeave={() => (selected === 'amend') && setTempAltHover(null)}
                 onMouseDown={() => handleTempAltClick(alt)}>
              T
            </div>}
          </div>;
        })}
      </div>
      </span>}
    </div>
  );
}