import React from 'react';
import { Link } from 'react-router-dom';

const ListActions = props => {
  const url = props.object ? `${props.match.path}/${props.object.id}/edit` : '';

  return (
    <div>
      <Link to={url} exact className="hl-primary-btn no-background no-border">
        <i className="lilicon hl-edit-icon" />
      </Link>

      <button className="hl-primary-btn no-background no-border m-l-10">
        <i className="lilicon hl-trashcan-icon" />
      </button>
    </div>
  );
};

export default ListActions;
