import {useContext, useState} from 'react';
import WindowTitleBar from "../WindowTitleBar";
import {AclContext, EdstContext} from "../../../contexts/contexts";
import {EdstHeaderButton} from "../../resources/EdstButton";

export default function AclHeader(props) {
  const {setInputFocused} = useContext(EdstContext)
  const {manual_posting, togglePosting} = useContext(AclContext);
  const [search_str, setSearchString] = useState('');
  const {focused, asel, sort_data} = props;
  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      props.addEntry(search_str);
      setSearchString('');
    }
  };

  return (<div>
    <WindowTitleBar
      focused={focused}
      closeWindow={props.closeWindow}
      text={['Aircraft List', `${sort_data.sector ? 'Sector/' : ''}${sort_data.name}`, `${manual_posting ? 'Manual' : 'Automatic'}`]}
    />
    <div className="no-select">
      <EdstHeaderButton disabled={asel === null}
                        onMouseDown={(e) => props.openMenu(e.target, 'plan-menu')}
                        content="Plan Options..."
      />
      <EdstHeaderButton
        disabled={asel === null}
        onMouseDown={(e) => props.openMenu(e.target, 'hold-menu')}
        content="Hold..."
      />
      <EdstHeaderButton disabled={true} content="Show"/>
      <EdstHeaderButton disabled={true} content="Show ALL"/>
      <EdstHeaderButton
        id="acl-sort-button"
        onMouseDown={(e) => props.openMenu(e.target, 'sort-menu')}
        content="Sort..."
      />
      <EdstHeaderButton disabled={true} content="Tools..."/>
      <EdstHeaderButton
        onMouseDown={togglePosting}
        content="Posting Mode"
      />
      <EdstHeaderButton
        onMouseDown={(e) => props.openMenu(e.target, 'template-menu')}
        content="Template..."
      />
      <EdstHeaderButton
        onMouseDown={props.cleanup}
        content="Clean Up"
      />
    </div>
    <div className="edst-window-header-bottom-row no-select">
      Add/Find
      <div className="input-container">
        <input
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          value={search_str}
          onChange={(e) => setSearchString(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  </div>);
}