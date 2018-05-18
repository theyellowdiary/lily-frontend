import React, { Component } from 'react';
import cx from 'classnames';

import Settings from 'models/Settings';

const statusIcons = ['', 'hl-toggle-up-icon', 'hl-toggle-down-icon', 'hl-toggle-left-icon'];

const HIDDEN = 0;
const VISIBLE = 1;
const COLLAPSED = 2;
const EXPANDED_WIDTH = 3;

const DEFAULT_SETTINGS = {
  status: VISIBLE
};

class Widget extends Component {
  constructor(props) {
    super(props);

    this.settings = new Settings(props.component);

    this.state = { loading: true, showFade: true };
  }

  componentDidMount = async () => {
    const settingsRequest = await this.settings.get();

    // Fill in any settings which aren't in the database yet.
    const settings = { ...DEFAULT_SETTINGS, ...settingsRequest.results };

    this.setState({ ...settings, loading: false });
  };

  heightToggle = () => {
    const expandHeight = !this.state.expandHeight;

    this.settings.store({ expandHeight }).then(() => {
      this.setState({ expandHeight });
    });
  };

  removeWidget = () => {
    const status = HIDDEN;

    this.settings.store({ status }).then(() => {
      this.setState({ status });
    });
  };

  toggleCollapse = () => {
    const { status } = this.state;
    const { expandable } = this.props;

    let newStatus;

    if (status === COLLAPSED) {
      newStatus = expandable ? EXPANDED_WIDTH : VISIBLE;
    } else if (status === EXPANDED_WIDTH) {
      newStatus = VISIBLE;
    } else {
      newStatus = COLLAPSED;
    }

    this.settings.store({ status: newStatus }).then(() => {
      this.setState({ status: newStatus });
    });
  };

  handleScroll = event => {
    const bottom = event.target.scrollHeight - event.target.scrollTop === event.target.clientHeight;

    this.setState({ showFade: !bottom });
  };

  render() {
    const { status, expandHeight, loading, showFade } = this.state;

    const widgetBodyClassName = cx('widget-body', {
      'expanded-height': expandHeight
    });

    return (
      <div className={`widget-container${status === EXPANDED_WIDTH ? ' expanded' : ''}`}>
        {!loading && status !== HIDDEN ? (
          <div className="widget">
            <div className="widget-header">
              <div className="widget-title">{this.props.title}</div>
              <div className="widget-extra">{this.props.extra}</div>
              <div className="widget-tools m-r-10">
                <button className="hl-interface-btn m-r-5" onClick={this.toggleCollapse}>
                  <i className={`lilicon ${statusIcons[status]}`} />
                </button>

                {this.props.closeable && (
                  <button className="close-btn" onClick={this.removeWidget}>
                    <i className="lilicon hl-close-icon" />
                  </button>
                )}
              </div>
            </div>
            {status !== COLLAPSED && (
              <React.Fragment>
                <div className={widgetBodyClassName} onScroll={this.handleScroll}>
                  {this.props.children}
                </div>

                {showFade && (
                  <div className="widget-scroll-fade clickable" onClick={this.heightToggle}>
                    <i className={`lilicon hl-toggle-${expandHeight ? 'up' : 'down'}-icon`} />
                  </div>
                )}
              </React.Fragment>
            )}
          </div>
        ) : null}
      </div>
    );
  }
}

export default Widget;
