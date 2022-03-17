import React, {useContext, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {closeWindow, windowPositionSelector} from "../../redux/slices/appSlice";
import {
  setSigmetAcknowledged,
  setSigmetSupressionState, setViewSigmetSuppressed,
  sigmetSelector,
  viewSigmetSuppressedSelector
} from "../../redux/slices/weatherSlice";
import {FloatingWindowOptions} from "./FloatingWindowOptions";

enum sigmetOptionEnum {
  viewSuppressed = "VIEW SUPPRESS",
  hideSuppressed = "HIDE SUPPRESS",
  printAll = "PRINT ALL"
}

export const SigmetWindow: React.FC = () => {
  const dispatch = useAppDispatch();
  const pos = useAppSelector(windowPositionSelector(windowEnum.sigmets));
  const sectorId = useAppSelector(state => state.sectorData.sectorId);
  const viewSuppressed = useAppSelector(viewSigmetSuppressedSelector);
  const sigmetList = useAppSelector(sigmetSelector);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<{ x: number, y: number, w: number } | null>(null);
  const {startDrag} = useContext(EdstContext);
  const ref = useRef<HTMLDivElement>(null);

  const handleEntryMouseDown = (event: React.MouseEvent<HTMLDivElement>, sigmetId: string) => {
    setShowOptions(false);
    if (selectedOption !== sigmetId) {
      if (!sigmetList[sigmetId].acknowledged) {
        dispatch(setSigmetAcknowledged({id: sigmetId, value: true}));
      }
      setSelectedOption(sigmetId);
      // figure out how to align this correctly :/
      setSelectedPos({
        x: event.currentTarget.offsetLeft,
        y: event.currentTarget.clientTop - 1,
        w: event.currentTarget.clientWidth + 23
      });
    } else {
      setSelectedOption(null);
      setSelectedPos(null);
    }
  };

  const handleOptionsMouseDown = () => {
    setSelectedOption(null);
    setShowOptions(true);
  };

  return pos && (<div className="floating-window sigmet-window"
                      ref={ref}
                      id="edst-status"
                      style={{left: pos.x + "px", top: pos.y + "px"}}
    >
      <div className="floating-window-header no-select">
        <div className="floating-window-header-left" onMouseDown={handleOptionsMouseDown}>
          M
        </div>
        <div className="floating-window-header-middle"
             onMouseDown={(event) => startDrag(event, ref, windowEnum.sigmets)}
        >
          SIGMETS SECTOR {sectorId}
        </div>
        <div className="floating-window-header-right" onMouseDown={() => dispatch(closeWindow(windowEnum.sigmets))}>
          <div className="floating-window-header-block-6-2"/>
        </div>
      </div>
      {Object.values(sigmetList).length > 0 &&
      <div className="floating-window-body scroll-container sigmet-scroll-container">
        {Object.entries(sigmetList).map(([sigmetId, sigmetEntry]) => (!sigmetEntry.suppressed || viewSuppressed) &&
          <span className="floating-window-outer-row sigmet" key={`sigmet-list-key-${sigmetId}`}>
            <div className={`floating-window-row ${sigmetEntry.suppressed ? 'suppressed' : ''} no-select margin ${selectedOption === sigmetId ? 'selected' : ''}`}
                 onMouseDown={(event) => handleEntryMouseDown(event, sigmetId)}
            >
              {sigmetEntry.text}
            </div>
            {selectedOption === sigmetId && selectedPos &&
            <FloatingWindowOptions
              pos={{
                x: (ref.current as HTMLDivElement).clientLeft + (ref.current as HTMLDivElement).clientWidth,
                y: (ref.current as HTMLDivElement).clientTop
              }}
              options={[!sigmetEntry.suppressed ? 'SUPPRESS' : 'RESTORE']}
              handleOptionClick={() => {
                dispatch(setSigmetSupressionState({id: sigmetId, value: !sigmetEntry.suppressed}));
                setSelectedOption(null);
                setSelectedPos(null);
              }}
            />}
          </span>)}
      </div>}
      {showOptions && <FloatingWindowOptions
        pos={{
          x: (ref.current as HTMLDivElement).clientLeft + (ref.current as HTMLDivElement).clientWidth,
          y: (ref.current as HTMLDivElement).clientTop
        }}
        header="SIGMETS"
        closeOptions={() => setShowOptions(false)}
        options={Object.values(sigmetOptionEnum)}
        selectedOptions={[viewSuppressed ? sigmetOptionEnum.viewSuppressed : sigmetOptionEnum.hideSuppressed
        ]}
        handleOptionClick={(option) => {
          switch (option as sigmetOptionEnum) {
            case sigmetOptionEnum.viewSuppressed:
              dispatch(setViewSigmetSuppressed(true));
              break;
            case sigmetOptionEnum.hideSuppressed:
              dispatch(setViewSigmetSuppressed(false));
              break;
            default: break;
          }
        }}
      />}
    </div>
  );
};