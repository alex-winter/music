import { Link } from 'react-router-dom';

import { NAV_ITEMS } from '../lib/constants';

function TopNav({ activeView }) {
  return (
    <div className="actions">
      {NAV_ITEMS.map(item => (
        <Link
          key={item.key}
          className={activeView === item.key ? 'button-link' : 'button-link secondary'}
          to={item.to}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export default TopNav;
