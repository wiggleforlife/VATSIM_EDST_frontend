import React, {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {computeFrd, formatUtcMinutes} from "../../lib";
import {EdstEntryType} from "../../types";
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {setAclPosting} from "../../redux/actions";

interface MessageComposeAreaProps {
  pos: { x: number, y: number };
  mca_command_string: string;
  setMcaCommandString: (s: string) => void;
  aclCleanup: () => void;
  closeAllWindows: () => void;
}


export const MessageComposeArea: React.FC<MessageComposeAreaProps> = (
  {
    mca_command_string,
    setMcaCommandString,
    pos,
    ...props
  }) => {
  const [response, setResponse] = useState<string | null>(null);
  const [mca_focused, setMcaFocused] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const acl_cid_list = useAppSelector(state => state.acl.cid_list);
  const dep_cid_list = useAppSelector(state => state.dep.cid_list);
  const manual_posting = useAppSelector((state) => state.acl.manual_posting);
  const dispatch = useAppDispatch();

  const {
    startDrag,
    setMcaInputRef,
    setInputFocused,
    openWindow,
    updateEntry,
    addEntry,
    edst_data,
    setMraMessage
  } = useContext(EdstContext);

  useEffect(() => {
    setMcaInputRef(inputRef);
    inputRef?.current?.focus();
    return () => setMcaInputRef(null);
    // eslint-disable-next-line
  }, []);

  const toggleVci = (fid: string) => {
    const entry: EdstEntryType | any = Object.values(edst_data ?? {})
      ?.find((e: EdstEntryType) => String(e.cid) === fid || String(e.callsign) === fid || String(e.beacon) === fid);
    if (entry) {
      if (entry.acl_status < 1) {
        updateEntry(entry.cid, {acl_status: 1});
      } else {
        updateEntry(entry.cid, {acl_status: 0});
      }
    }
  };

  const toggleHighlightEntry = (fid: string) => {
    const entry: EdstEntryType | any = Object.values(edst_data ?? {})
      ?.find((entry: EdstEntryType) => String(entry?.cid) === fid || String(entry.callsign) === fid || String(entry.beacon) === fid);
    if (entry) {
      if (acl_cid_list.has(entry.cid)) {
        updateEntry(entry.cid, {acl_highlighted: !entry.acl_highlighted});
      }
      if (dep_cid_list.has(entry.cid)) {
        updateEntry(entry.cid, {dep_highlighted: !entry.dep_highlighted});
      }
    }
  };

  const flightplanReadout = (fid: string) => {
    const now = new Date();
    const utc_minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const entry: EdstEntryType | any = Object.values(edst_data ?? {})
      ?.find((entry: EdstEntryType) => String(entry?.cid) === fid || String(entry.callsign) === fid || String(entry.beacon) === fid);
    if (entry) {
      let msg = formatUtcMinutes(utc_minutes) + '\n'
        + `${entry.cid} ${entry.callsign} ${entry.type}/${entry.equipment} ${entry.beacon} ${entry.flightplan.ground_speed} EXX00`
        + ` ${entry.altitude} ${entry.dep}./${'.' + computeFrd(entry?.reference_fix)}..${entry._route.replace(/^\.+/, '')}`;
      setMraMessage(msg);
    }
  };

  const parseCommand = () => {
    const [command, ...args] = mca_command_string.split(/\s+/);
    // console.log(command, args)
    if (command.match(/\/\/\w+/)) {
      toggleVci(command.slice(2));
      setResponse(`ACCEPT\nD POS KEYBD`);
    } else {
      switch (command) {
        case '//': // should turn wifi on/off for a CID
          toggleVci(args[0]);
          setResponse(`ACCEPT\nD POS KEYBD`);
          break;
        case 'UU':
          switch (args.length) {
            case 0:
              openWindow('acl');
              setResponse(`ACCEPT\nD POS KEYBD`);
              break;
            case 1:
              switch (args[0]) {
                case 'C':
                  props.aclCleanup();
                  break;
                case 'D':
                  openWindow('dep');
                  break;
                case 'P':
                  openWindow('acl');
                  dispatch(setAclPosting(!manual_posting));
                  break;
                case 'X':
                  props.closeAllWindows();
                  break;
                default:
                  addEntry(null, args[0]);
                  break;
              }
              setResponse(`ACCEPT\nD POS KEYBD`);
              break;
            case 2:
              if (args[0] === 'H') {
                toggleHighlightEntry(args[1]);
                setResponse(`ACCEPT\nD POS KEYBD`);
              } else {
                setResponse(`REJECT\n${mca_command_string}`);
              }
              break;
            default: // TODO: give error msg
              setResponse(`REJECT\n${mca_command_string}`);
          }
          break;
        case 'FR':
          if (args.length === 1) {
            flightplanReadout(args[0]);
            setResponse(`ACCEPT\nREADOUT\n${mca_command_string}`);
          } else {
            setResponse(`REJECT: MESSAGE TOO LONG\nREADOUT\n${mca_command_string}`);
          }
          break;
        default: // better error msg
          setResponse(`REJECT\n\n${mca_command_string}`);
      }
    }
    setMcaCommandString('');
  };

  const handleChange = (event: React.ChangeEvent<any>) => {
    event.preventDefault();
    setMcaCommandString(event.target.value.toUpperCase());
  };

  const handleKeyDown = (event: React.KeyboardEvent<any>) => {
    if (event.shiftKey || event.ctrlKey) {
      inputRef?.current?.blur();
    }
    switch (event.key) {
      case "Enter":
        if (mca_command_string.length > 0) {
          parseCommand();
        } else {
          setResponse('');
        }
        break;
      case "Escape":
        setMcaCommandString('');
        break;
      default:
        break;
    }
  };

  return (<div className="floating-window mca"
               ref={ref}
               id="edst-mca"
               style={{left: pos.x + "px", top: pos.y + "px"}}
               onMouseDown={(event) => startDrag(event, ref)}
      // onMouseEnter={() => setInputFocus()}
    >
      <div className="mca-input-area">
        <input
          ref={inputRef}
          onFocus={() => {
            setInputFocused(true);
            setMcaFocused(true);
          }}
          onBlur={() => {
            setInputFocused(false);
            setMcaFocused(false);
          }}
          tabIndex={mca_focused ? -1 : undefined}
          value={mca_command_string}
          onChange={handleChange}
          onKeyDownCapture={handleKeyDown}
        />
      </div>
      <div className="mca-response-area">
        {response}
      </div>
    </div>
  );
};
