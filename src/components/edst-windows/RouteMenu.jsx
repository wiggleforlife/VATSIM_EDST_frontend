import {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import PreferredRouteDisplay from "./PreferredRouteDisplay";
import {computeFrd, copy} from "../../lib";
import {EdstContext} from "../../contexts/contexts";
import VATSIM_LOGO from '../../css/images/VATSIM-social_icon.svg';
import {EdstButton} from "../resources/EdstButton";

export function RouteMenu(props) {
  const {
    edst_data,
    openMenu,
    asel,
    trialPlan,
    amendEntry,
    startDrag,
    stopDrag,
    setInputFocused
  } = useContext(EdstContext);
  const [dep, setDep] = useState(asel?.window === 'dep');
  const [entry, setEntry] = useState(edst_data?.[asel?.cid]);
  const current_route_fixes = entry?._route_data.map(fix => fix.name);
  const [focused, setFocused] = useState(false);
  const [display_raw_route, setDisplayRawRoute] = useState(false);
  const [route, setRoute] = useState(dep ? entry.route : entry._route?.replace(/^\.*/, ''));
  const [route_input, setRouteInput] = useState(dep ? entry.dep + route : route);
  const [trial_plan, setTrialPlan] = useState(!dep);
  const routes = (dep ? entry.routes : []).concat(entry._aar_list?.filter(aar_data => current_route_fixes.includes(aar_data.tfix)));
  const [append, setAppend] = useState({append_oplus: false, append_star: false});
  const [frd, setFrd] = useState(entry.reference_fix ? computeFrd(entry.reference_fix) : 'XXX000000');
  const {append_oplus, append_star} = append;

  const ref = useRef(null);
  const {pos} = props;

  useEffect(() => {
    const entry = edst_data?.[asel?.cid];
    const dep = asel?.window === 'dep';
    const route = dep ? entry.route : entry._route?.replace(/^\.*/, '');
    setDep(dep);
    setTrialPlan(!dep);
    setEntry(entry);
    setRoute(route);
    setRouteInput(dep ? entry.dep + route : route);
    setFrd(entry.reference_fix ? computeFrd(entry.reference_fix) : 'XXX000000');
  }, [asel, edst_data]);

  const clearedReroute = (reroute_data) => {
    let plan_data;
    const dest = entry.dest
    if (!reroute_data.aar) {
      plan_data = {route: reroute_data.route, route_data: reroute_data.route_data};
    } else {
      plan_data = {route: reroute_data.amended_route, route_fixes: reroute_data.amended_route_fixes};
    }
    if (plan_data.route.slice(-dest.length) === dest) {
      plan_data.route = plan_data.route.slice(0, -dest.length);
    }
    // navigator.clipboard.writeText(`${!dep ? frd + '..' : ''}${plan_data.route}`); // this only works with https or localhost
    copy(`${!dep ? frd : ''}${plan_data.route}`);
    if (trial_plan) {
      const msg = `AM ${entry.cid} RTE ${plan_data.route}${entry.dest}`;
      trialPlan({
        cid: entry.cid,
        callsign: entry.callsign,
        plan_data: plan_data,
        msg: msg
      });
    } else {
      amendEntry(entry.cid, plan_data);
    }
    props.closeWindow();
  }

  const clearedToFix = (cleared_fix_name) => {
    let {_route: new_route, _route_data, dest} = entry;
    let fix_names = _route_data.map(e => e.name);
    const index = fix_names.indexOf(cleared_fix_name);
    for (let name of fix_names.slice(0, index + 1).reverse()) {
      if (new_route.includes(name)) {
        new_route = new_route.slice(new_route.indexOf(name) + name.length);
        if (!Number(new_route[0])) {
          new_route = `..${cleared_fix_name}` + new_route;
        } else {
          new_route = `..${cleared_fix_name}.${name}${new_route}`;
        }
        break;
      }
    }
    // new_route = `..${fix}` + new_route;
    if (new_route.slice(-dest.length) === dest) {
      new_route = new_route.slice(0, -dest.length);
    }
    // navigator.clipboard.writeText(`${!dep ? frd : ''}${new_route}`); // this only works with https or localhost
    copy(`${!dep ? frd : ''}${new_route}`.replace(/\.+$/, ''));
    const plan_data = {
      route: new_route,
      route_data: _route_data.slice(index),
      cleared_direct: {frd: (!dep ? frd : null), fix: cleared_fix_name}
    };
    if (trial_plan) {
      trialPlan({
        cid: entry.cid,
        callsign: entry.callsign,
        plan_data: plan_data,
        msg: `AM ${entry.cid} RTE ${!dep && plan_data.cleared_direct.frd}${new_route}`
      });
    } else {
      amendEntry(entry.cid, plan_data);
    }
    props.closeWindow();
  }

  const handleInputChange = (event) => {
    event.preventDefault();
    setRouteInput(event.target.value.toUpperCase());
  }

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      copy(`${!dep ? frd : ''}${route}`.replace(/\.+$/, ''));
      const plan_data = {route: route};
      if (trial_plan) {
        trialPlan({
          cid: entry.cid,
          callsign: entry.callsign,
          plan_data: plan_data,
          msg: `AM ${entry.cid} RTE ${route}`
        });
      } else {
        amendEntry(entry.cid, plan_data);
      }
      props.closeWindow();
    }
  }

  const route_data = dep ? entry.route_data : entry?._route_data;

  return (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu route no-select"
      ref={ref}
      id="route-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref)}
           onMouseUp={(event) => stopDrag(event)}
      >
        Route Menu
      </div>
      <div className="options-body">
        <div className="options-row fid">
          {entry.callsign} {entry.type}/{entry.equipment}
        </div>
        <div className="options-row route-row">
          <div className="options-col">
            <EdstButton content="Trial Plan" selected={trial_plan} onMouseDown={() => setTrialPlan(true)}/>
          </div>
          <div className="options-col center">
            <img src={VATSIM_LOGO} alt="vatsim-logo"
                 onMouseDown={() => setDisplayRawRoute(!display_raw_route)}
                 onContextMenu={(event) => event.preventDefault()}
            />
          </div>
          <div className={`options-col right ${!trial_plan ? 'selected' : ''}`}
            // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
          >
            <EdstButton content="Amend" selected={!trial_plan} onMouseDown={() => setTrialPlan(false)}/>
          </div>
        </div>
        <div className="options-row route-row"
          // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
        >
          <div className="options-col">
            <div className="input">
              {!dep && <span className="ppos"
                             onContextMenu={(event) => {
                               event.preventDefault();
                               copy(frd);
                             }}>
                  {frd}..
                </span>}
              <span className="route-input">
                  <input
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    value={display_raw_route ? entry.flightplan.route : route_input}
                    onChange={(event) => !display_raw_route && handleInputChange(event)}
                    onKeyDown={(event) => !display_raw_route && handleInputKeyDown(event)}
                  />
              </span>
            </div>
          </div>
        </div>
        <div className="options-row route-row top-border">
          <div className="options-col hover button" disabled={true}>
            <EdstButton disabled={true} classes="tiny"/>
            Include PAR
          </div>
        </div>
        <div className="options-row route-row bottom-border">
          <div className="options-col hover button"
               onMouseDown={() => setAppend({append_star: !append_star, append_oplus: false})}
          >
            <EdstButton disabled={true} classes="tiny" selected={append_star}/>
            Append *
          </div>
          <div className="options-col hover button"
               onMouseDown={() => setAppend({append_oplus: !append_oplus, append_star: false})}
          >
            <EdstButton disabled={true} classes="tiny" selected={append_oplus}/>
            Append<span>&nbsp;⊕</span>
          </div>
        </div>
        <div className="options-row route-row underline">
          Direct-To-Fix
        </div>
        <div className="options-row">
          <div className="options-col display-route">
            {dep ? entry.dep + route : `./.${route}`}
          </div>
        </div>
        {[...Array(Math.min(route_data?.length ?? 0, 10)).keys()].map(i => <div className="options-row"
                                                                                key={`route-menu-row-${i}`}>
          {[...Array(((route_data?.length ?? 0) / 10 | 0) + 1).keys()].map(j => {
            const fix_name = route_data[i + j * 10]?.name;
            return (fix_name && <div className="options-col dct-col hover" key={`route-menu-col-${i}-${j}`}
                                     onMouseDown={() => clearedToFix(fix_name)}>
              {fix_name}
            </div>);
          })
          }
        </div>)}
        {routes?.length > 0 &&
        <PreferredRouteDisplay routes={routes} clearedReroute={clearedReroute}/>}
        <div className="options-row bottom">
          <div className="options-col left">
            <EdstButton disabled={true} content="Flight Data"/>
            <EdstButton disabled={entry?.previous_route === undefined} content="Previous Route"
                        onMouseDown={() => openMenu(ref.current, 'prev-route-menu', true)}
            />
            <EdstButton disabled={true} content="TFM Reroute Menu"/>
          </div>
          <div className="options-col right">
            <EdstButton content="Exit" onMouseDown={props.closeWindow}/>
          </div>
        </div>
      </div>
    </div>
  );
}
