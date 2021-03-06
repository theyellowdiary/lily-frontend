import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ESCAPE_KEY } from 'lib/constants';

class Dropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menuOpen: false
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.closeMenu);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.closeMenu);
  }

  showMenu = event => {
    event.preventDefault();

    this.setState({ menuOpen: true }, () => {
      document.addEventListener('click', this.closeMenu);
    });
  };

  closeMenu = event => {
    const closeMenu =
      event.keyCode === ESCAPE_KEY ||
      (this.dropdownMenu && !this.dropdownMenu.contains(event.target));

    if (closeMenu) {
      this.setState({ menuOpen: false }, () => {
        document.removeEventListener('click', this.closeMenu);
      });
    }
  };

  render() {
    const { menuOpen } = this.state;
    const { clickable, menu, clearCallback, className } = this.props;

    return (
      <div className={className || 'display-inline-block'}>
        <div className={`dropdown-container${clearCallback ? ' is-clearable' : ''}`}>
          <div className="clickable" onClick={this.showMenu} role="button" tabIndex={0}>
            {clickable}
          </div>

          {clearCallback && (
            <button className="hl-primary-btn-red" onClick={clearCallback}>
              <FontAwesomeIcon icon="times" />
            </button>
          )}
        </div>

        {menuOpen ? (
          <div
            className="dropdown-menu-container"
            ref={element => {
              this.dropdownMenu = element;
            }}
          >
            {menu}
          </div>
        ) : null}
      </div>
    );
  }
}

export default Dropdown;
