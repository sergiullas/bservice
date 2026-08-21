import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import HomeIcon from '@material-ui/icons/Home';
import SettingsSystemDaydreamIcon from '@material-ui/icons/SettingsSystemDaydream';
import ExtensionIcon from '@material-ui/icons/Extension';
import DescriptionIcon from '@material-ui/icons/Description';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import SearchIcon from '@material-ui/icons/Search';
import SettingsIcon from '@material-ui/icons/Settings';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import svgPaths from '../../imports/BrandOnePager/svg-i0ml0afi0n';

const EXPANDED_WIDTH = 220;
const COLLAPSED_WIDTH = 56;

// Brand colors from the design import
const BRAND_DARK = '#003E5A';
const BRAND_LIGHT = '#A5C9EB';
const BRAND_BLUE = '#005288';

const useStyles = makeStyles({
  sidebar: {
    flexShrink: 0,
    backgroundColor: '#fff',
    borderRight: '1px solid #E0E0E0',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
    transition: 'width 0.2s ease',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 12px',
    minHeight: 52,
    flexShrink: 0,
    gap: 9,
    overflow: 'hidden',
  },
  logoMark: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWordmark: {
    display: 'flex',
    alignItems: 'baseline',
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    transition: 'opacity 0.15s ease, max-width 0.2s ease',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    margin: '4px 0',
    flexShrink: 0,
  },
  navSection: {
    flex: 1,
    padding: '6px 0',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    margin: '1px 4px',
    borderRadius: 6,
    cursor: 'pointer',
    color: '#444',
    userSelect: 'none' as const,
    transition: 'background-color 0.15s ease',
    minHeight: 36,
    '&:hover': {
      backgroundColor: '#EBF3F8',
    },
  },
  activeNavItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    margin: '1px 4px',
    borderRadius: 6,
    cursor: 'default',
    color: '#fff',
    userSelect: 'none' as const,
    backgroundColor: BRAND_BLUE,
    minHeight: 36,
    '&:hover': {
      backgroundColor: '#004577',
    },
  },
  navIcon: {
    flexShrink: 0,
    fontSize: 20,
  },
  navLabel: {
    fontSize: 13,
    whiteSpace: 'nowrap',
    marginLeft: 10,
    overflow: 'hidden',
    transition: 'opacity 0.15s ease',
  },
  bottomSection: {
    flexShrink: 0,
    padding: '6px 0',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '6px 8px',
    cursor: 'pointer',
    color: '#888',
    userSelect: 'none' as const,
    '&:hover': {
      color: BRAND_BLUE,
    },
  },
  toggleIcon: {
    fontSize: 18,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.05em',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.15s ease',
  },
});

// ── cloudCBP logo mark (two-color cloud SVG from brand import) ────────────────
function CloudMark({ size = 28 }: { size?: number }) {
  const h = Math.round(size * (71 / 97));
  return (
    <svg fill="none" height={h} viewBox="0 0 97 71" width={size}>
      <path d={svgPaths.pad25100} fill={BRAND_DARK} />
      <path d={svgPaths.p36e8f380} fill={BRAND_LIGHT} />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Home', icon: HomeIcon, active: false },
  { label: 'Service Offerings', icon: SettingsSystemDaydreamIcon, active: true },
  { label: 'APIs', icon: ExtensionIcon, active: false },
  { label: 'Docs', icon: DescriptionIcon, active: false },
  { label: 'Create...', icon: AddCircleOutlineIcon, active: false },
];

function NavItem({
  label,
  icon: Icon,
  active,
  collapsed,
  classes,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
  classes: ReturnType<typeof useStyles>;
}) {
  return (
    <div
      className={active ? classes.activeNavItem : classes.navItem}
      role="menuitem"
      aria-current={active ? 'page' : undefined}
      title={collapsed ? label : undefined}
    >
      <Icon className={classes.navIcon} style={{ color: active ? '#fff' : '#666' }} />
      <span
        className={classes.navLabel}
        style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 160 }}
      >
        {label}
      </span>
    </div>
  );
}

export function Sidebar() {
  const classes = useStyles();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div
      className={classes.sidebar}
      style={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
    >
      {/* Brand logo */}
      <div className={classes.logoSection}>
        <div className={classes.logoMark}>
          <CloudMark size={collapsed ? 28 : 26} />
        </div>
        {/* Wordmark: "cloud" Merriweather + "CBP" Lato ExtraBold */}
        <div
          className={classes.logoWordmark}
          style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 140 }}
        >
          <span
            style={{
              fontFamily: "'Merriweather', serif",
              fontWeight: 400,
              fontSize: '1.2rem',
              color: BRAND_BLUE,
              letterSpacing: '0.01em',
            }}
          >
            cloud
          </span>
          <span
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 800,
              fontSize: '1.4rem',
              color: BRAND_BLUE,
              letterSpacing: '0.01em',
            }}
          >
            CBP
          </span>
        </div>
      </div>

      {/* Search row */}
      <div
        className={classes.navItem}
        role="menuitem"
        title={collapsed ? 'Search' : undefined}
      >
        <SearchIcon className={classes.navIcon} style={{ color: '#666' }} />
        <span
          className={classes.navLabel}
          style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 160 }}
        >
          Search
        </span>
      </div>

      <div className={classes.divider} />

      {/* Main nav */}
      <nav className={classes.navSection}>
        {NAV_ITEMS.map(({ label, icon, active }) => (
          <NavItem
            key={label}
            label={label}
            icon={icon}
            active={active}
            collapsed={collapsed}
            classes={classes}
          />
        ))}
      </nav>

      <div className={classes.divider} />

      {/* Bottom section */}
      <div className={classes.bottomSection}>
        <div
          className={classes.navItem}
          role="menuitem"
          title={collapsed ? 'Settings' : undefined}
        >
          <SettingsIcon className={classes.navIcon} style={{ color: '#666' }} />
          <span
            className={classes.navLabel}
            style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 160 }}
          >
            Settings
          </span>
        </div>

        <div className={classes.divider} />

        {/* Collapse toggle */}
        <div
          className={classes.toggleRow}
          onClick={() => setCollapsed(!collapsed)}
          role="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <>
              <ChevronRightIcon className={classes.toggleIcon} />
              <ChevronRightIcon className={classes.toggleIcon} style={{ marginLeft: -10 }} />
            </>
          ) : (
            <>
              <span className={classes.toggleLabel} />
              <ChevronLeftIcon className={classes.toggleIcon} />
              <ChevronLeftIcon className={classes.toggleIcon} style={{ marginLeft: -10 }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
