import type { ArtworkId } from './profiles'
import './profiles.css'
// Original side elevations, authored from category proportions; no OEM artwork.
const outlines: Record<ArtworkId, string> = {
  sedan: 'M38 165 L45 137 Q55 128 129 123 L208 77 Q220 72 288 73 L365 111 L461 124 L472 145 L470 165 L414 166 Q407 130 381 132 Q352 133 346 166 L153 166 Q147 130 119 132 Q91 133 85 166 Z',
  coupe: 'M43 164 L45 143 L113 123 L195 72 L293 75 L365 120 L449 128 L470 146 L469 164 L414 164 Q410 131 381 131 Q352 132 347 164 L157 164 Q149 132 121 132 Q92 132 87 164 Z',
  evo: 'M40 166 L43 128 L128 121 L202 78 L296 78 L357 117 L443 123 L446 103 L471 103 L471 112 L459 113 L474 145 L471 166 L418 166 Q410 131 382 131 Q352 131 346 166 L153 166 Q148 131 119 131 Q89 131 83 166 Z',
  rally: 'M39 165 L44 134 L103 121 L127 119 L141 108 L173 108 L171 116 L207 77 Q250 64 294 78 L358 114 L451 123 L466 142 L469 165 L417 165 Q411 131 382 131 Q353 131 347 165 L154 165 Q148 131 119 131 Q90 131 84 165 Z',
  mini: 'M117 166 L115 128 Q114 113 139 110 L157 69 Q170 48 216 49 L296 49 Q320 51 329 77 L342 110 L367 118 L374 143 L373 166 L335 166 Q331 139 307 139 Q281 139 277 166 L211 166 Q207 139 182 139 Q155 139 151 166 Z',
  offroad: 'M67 168 L67 108 L137 103 L151 53 L369 53 L389 73 L400 145 L409 146 L409 168 L366 168 Q360 129 330 129 Q299 129 295 168 L189 168 Q184 129 151 129 Q118 129 113 168 Z',
  roadster: 'M47 165 Q36 143 74 133 Q99 109 193 110 L221 75 L236 74 L244 113 Q286 125 305 102 Q321 98 336 106 L355 122 Q426 118 455 142 L459 165 L409 166 Q401 132 374 132 Q345 132 340 166 L154 166 Q149 132 120 132 Q90 132 84 166 Z',
  utility4x4: 'M75 168 L75 95 L95 95 L100 60 L260 60 L268 95 L330 95 L345 130 L400 130 L400 168 L360 168 Q354 131 325 131 Q296 131 290 168 L185 168 Q180 131 151 131 Q122 131 116 168 Z',
  rallysuv: 'M50 164 L54 122 L134 116 L156 74 Q195 58 285 62 L349 100 L437 113 L459 138 L462 164 L412 164 Q406 130 377 130 Q348 130 342 164 L158 164 Q153 130 124 130 Q95 130 89 164 Z',
}
export function CarSilhouette({ artwork, animated = false, connected = true }: { artwork: ArtworkId; animated?: boolean; connected?: boolean }) {
  const mini = artwork === 'mini', offroadFamily = artwork === 'offroad' || artwork === 'utility4x4' || artwork === 'rallysuv'
  const wheels = mini ? [182,307] : artwork==='utility4x4' ? [151,325] : artwork==='rallysuv' ? [124,377] : offroadFamily ? [151,330] : [120, artwork === 'roadster' ? 374 : 382]
  return <svg className={`rd-car-art ${animated?'animated':''} ${connected?'connected':'disconnected'}`} viewBox="0 0 510 215" role="img" aria-label={`${artwork} vehicle illustration`}>
    <path d="M32 191 H478" stroke="currentColor" opacity=".15"/><path className="car-body" d={outlines[artwork]} fill="currentColor" fillOpacity=".04" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" pathLength="1"/>
    {!mini && !offroadFamily && artwork!=='roadster' && <path d="M151 117 L211 83 L285 83 L342 114 Z M252 83 V116 M174 125 L173 160 M342 122 V158 M184 126 H207 M306 125 H327" fill="none" stroke="currentColor" opacity=".6"/>}
    {mini && <path d="M145 109 L166 64 H217 V109 Z M230 63 H294 Q309 63 316 83 L322 108 H230 Z M229 117 V160 M244 119 H258" fill="none" stroke="currentColor" opacity=".65"/>}
    {artwork==='offroad' && <path d="M146 100 L161 64 H210 V100 Z M222 64 H285 V100 H222 Z M297 64 H366 L380 100 H297 Z M215 107 V158 M290 107 V157 M62 101 H121" fill="none" stroke="currentColor" opacity=".65"/>}
    {artwork==='utility4x4' && <path d="M105 95 V60 M172 95 V60 M235 95 V60 M100 60 H268 M345 130 H400 M75 95 H345" fill="none" stroke="currentColor" opacity=".65"/>}
    {artwork==='rallysuv' && <path d="M156 74 L164 116 M234 66 L237 113 Q262 100 285 113 M349 100 L342 130 M54 122 H134 M205 46 H265" fill="none" stroke="currentColor" opacity=".65"/>}
    {artwork==='rallysuv' && <g opacity=".8"><circle cx="440" cy="124" r="16" fill="var(--cl-background,#101a14)" stroke="currentColor" strokeWidth="2"/><circle cx="440" cy="124" r="8" fill="none" stroke="currentColor"/></g>}
    {wheels.map(x=><g key={x} className="car-wheel"><circle cx={x} cy="163" r={offroadFamily?29:mini?23:27} fill="var(--cl-background,#101a14)" stroke="currentColor" strokeWidth="2"/><circle cx={x} cy="163" r="17" fill="none" stroke="currentColor" opacity=".5"/>{Array.from({length:8},(_,i)=><path key={i} d={`M${x} 150 V157`} transform={`rotate(${i*45} ${x} 163)`} stroke="currentColor"/> )}<circle cx={x} cy="163" r="5" fill="none" stroke="currentColor"/></g>)}
    <path d={mini?'M118 122 h14':artwork==='utility4x4'?'M78 118 h16':artwork==='rallysuv'?'M58 132 h16':offroadFamily?'M68 116 h16':'M46 140 h22'} className="car-headlight" stroke="var(--cl-primary-bright,currentColor)" strokeWidth="5"/>
    <path d={mini?'M366 127 v14':artwork==='utility4x4'?'M397 138 v14':artwork==='rallysuv'?'M456 146 v14':offroadFamily?'M392 118 v17':'M459 135 v11'} stroke="#b66a4e" strokeWidth="4"/>
  </svg>
}
