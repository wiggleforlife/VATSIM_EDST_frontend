import React from 'react';
import {TooltipContext} from "../../contexts/contexts";
import '../../css/resources/tooltip.scss';

const TooltipContent: React.FC<{content: any}> = (props) => {
  return (<div className="tooltip-content" tabIndex={999}>
    {props.content}
  </div>);
}

interface EdstTooltipProps {
    title?: string;
    className?: string;
    content?: string;
    onMouseDown?: React.EventHandler<any>;
    onContextMenu?: React.EventHandler<any>;
    disabled?: boolean;
}

export const EdstTooltip: React.FC<EdstTooltipProps> = ({title, content, ...props}) => {
  const {globalTooltipsEnabled, showAllTooltips} = React.useContext(TooltipContext);
  const [tooltip_enabled, setTooltipEnabled] = React.useState(false);

  return (<span
    {...props}
    onMouseEnter={(e) => e.shiftKey && setTooltipEnabled(true)}
    // onKeyDownCapture={(e) => e.shiftKey && setTooltipEnabled(!tooltip_enabled)}
    onMouseLeave={() => setTooltipEnabled(false)}
  >
        {globalTooltipsEnabled && (tooltip_enabled || showAllTooltips) && title &&
        <TooltipContent content={title}/>}
    {content ?? props.children}
    </span>);
}
