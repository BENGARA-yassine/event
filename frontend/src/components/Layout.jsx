import { NavLink } from 'react-router-dom';
const links = [['/dashboard','Vue d’ensemble'],['/events','Événements'],['/participants','Participants'],['/registrations/new','Inscriptions']];
export default function Layout({ user, logout, children }) { return <div className="shell"><aside><div className="logo">✦ <b>eventhub</b></div><nav>{links.map(([to,label])=><NavLink key={to} to={to}>{label}</NavLink>)}</nav><div className="user"><b>{user.fullName}</b><small>{user.role}</small><button onClick={logout}>↪</button></div></aside><main>{children}</main></div>; }
