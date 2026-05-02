import { useState } from 'react';
import { Plus, Minus, Maximize2, Minimize2, Armchair, X, Save, Edit3 } from 'lucide-react';

const VisualTheaterEditor = ({ layoutConfig, setLayoutConfig, onClose, onSave }) => {
  // Local state for the layout being edited before saving
  const [layout, setLayout] = useState(
    layoutConfig && layoutConfig.length > 0 
      ? [...layoutConfig] 
      : Array.from({ length: 10 }, (_, i) => ({
          rowLabel: String.fromCharCode(65 + i),
          leftSeats: 5,
          rightSeats: 5,
          aisleGap: 2,
          tier: i < 2 ? 'recliner' : i < 5 ? 'premium' : 'standard'
        }))
  );

  const updateRow = (idx, updates) => {
    const newLayout = [...layout];
    newLayout[idx] = { ...newLayout[idx], ...updates };
    
    // Bounds checking
    if (newLayout[idx].leftSeats < 0) newLayout[idx].leftSeats = 0;
    if (newLayout[idx].rightSeats < 0) newLayout[idx].rightSeats = 0;
    if (newLayout[idx].aisleGap < 0) newLayout[idx].aisleGap = 0;
    
    setLayout(newLayout);
  };

  const addRowTop = () => {
    // Determine the next starting label (shift everything down)
    // Actually, shifting labels is tricky. Let's just generate fresh labels A-Z at the end.
    const newRow = { rowLabel: '?', leftSeats: 5, rightSeats: 5, aisleGap: 2, tier: 'standard' };
    const nextLayout = [newRow, ...layout];
    nextLayout.forEach((r, i) => r.rowLabel = String.fromCharCode(65 + i));
    setLayout(nextLayout);
  };

  const addRowBottom = () => {
    const nextLayout = [...layout, { rowLabel: '?', leftSeats: 5, rightSeats: 5, aisleGap: 2, tier: 'standard' }];
    nextLayout.forEach((r, i) => r.rowLabel = String.fromCharCode(65 + i));
    setLayout(nextLayout);
  };

  const removeRowTop = () => {
    if (layout.length <= 1) return;
    const nextLayout = layout.slice(1);
    nextLayout.forEach((r, i) => r.rowLabel = String.fromCharCode(65 + i));
    setLayout(nextLayout);
  };

  const removeRowBottom = () => {
    if (layout.length <= 1) return;
    setLayout(layout.slice(0, -1));
  };

  const getTierColor = (tier) => {
    if (tier === 'recliner') return 'bg-red-500 border-red-600';
    if (tier === 'premium') return 'bg-purple-500 border-purple-600';
    return 'bg-blue-500 border-blue-600';
  };

  const CtrlBtn = ({ onClick, icon: Icon, disabled }) => (
    <button type="button" disabled={disabled} onClick={onClick} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-red-600 disabled:opacity-50 transition-colors shrink-0">
      <Icon size={12} strokeWidth={3} />
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2"><Edit3 size={20} className="text-red-600" /> Interactive Layout Editor</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Customize per-row capacities and tiers dynamically.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Editor Stage */}
        <div className="flex-1 overflow-auto bg-[#fdfdfd] relative flex flex-col items-center justify-start p-6 sm:p-12">
          
          <div className="flex items-center gap-4 mb-4 shrink-0">
             <CtrlBtn icon={Plus} onClick={addRowTop} />
             <div className="text-[0.65rem] font-extrabold text-gray-400 tracking-widest uppercase">Add Row Top</div>
             <CtrlBtn icon={Minus} onClick={removeRowTop} disabled={layout.length <= 1} />
          </div>

          <div className="flex flex-col gap-3 relative z-10 w-full max-w-5xl mx-auto items-center pb-8 shrink-0 px-2 lg:px-8">
            {layout.map((rowConfig, idx) => (
              <div key={idx} className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap justify-center w-full bg-white py-2 px-1 sm:px-3 rounded-xl shadow-sm border border-gray-100 group">
                
                {/* Tier Selector */}
                <select 
                  className="text-[0.65rem] font-bold uppercase tracking-wider bg-gray-50 border border-gray-200 text-gray-600 rounded px-1.5 py-1 outline-none focus:border-red-400 cursor-pointer w-20 shrink-0 hidden md:block"
                  value={rowConfig.tier}
                  onChange={(e) => updateRow(idx, { tier: e.target.value })}
                >
                  <option value="recliner">Recliner</option>
                  <option value="premium">Premium</option>
                  <option value="standard">Standard</option>
                </select>

                <div className="w-5 text-center text-xs font-black text-gray-900 shrink-0 ml-1">{rowConfig.rowLabel}</div>

                {/* Left Side */}
                <div className="flex-1 flex justify-end items-center gap-1 min-w-0">
                  <div className="flex items-center gap-1 shrink-0 px-1 opacity-20 group-hover:opacity-100 transition-opacity">
                    <CtrlBtn icon={Minus} onClick={() => updateRow(idx, { leftSeats: rowConfig.leftSeats - 1 })} disabled={rowConfig.leftSeats <= 0} />
                    <CtrlBtn icon={Plus} onClick={() => updateRow(idx, { leftSeats: rowConfig.leftSeats + 1 })} />
                  </div>
                  
                  <div className="flex gap-1 overflow-x-auto p-1 text-right  no-scrollbar shrink-0 max-w-[40vw] md:max-w-none">
                    {Array.from({ length: rowConfig.leftSeats }).map((_, cIdx) => (
                      <div key={cIdx} className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded border border-black/10 flex items-center justify-center text-white ${getTierColor(rowConfig.tier)}`}>
                        <Armchair size={10} className="opacity-80" />
                      </div>
                    ))}
                    {rowConfig.leftSeats === 0 && <span className="text-[0.6rem] text-gray-300 italic px-2 self-center">No seats</span>}
                  </div>
                </div>

                {/* Aisle gap - perfectly centered! */}
                <div className="flex items-center shrink-0 min-w-[20px] justify-center gap-1 bg-gray-50/50 rounded-lg px-1 group-hover:bg-gray-100" style={{ width: `${Math.max(20, rowConfig.aisleGap * 10)}px` }}>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <CtrlBtn icon={Minimize2} onClick={() => updateRow(idx, { aisleGap: rowConfig.aisleGap - 1 })} disabled={rowConfig.aisleGap <= 0} />
                     <CtrlBtn icon={Maximize2} onClick={() => updateRow(idx, { aisleGap: rowConfig.aisleGap + 1 })} />
                   </div>
                </div>

                {/* Right Side */}
                <div className="flex-1 flex justify-start items-center gap-1 min-w-0">
                  <div className="flex gap-1 overflow-x-auto p-1  no-scrollbar shrink-0 max-w-[40vw] md:max-w-none">
                    {Array.from({ length: rowConfig.rightSeats }).map((_, cIdx) => (
                      <div key={cIdx} className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded border border-black/10 flex items-center justify-center text-white ${getTierColor(rowConfig.tier)}`}>
                        <Armchair size={10} className="opacity-80" />
                      </div>
                    ))}
                    {rowConfig.rightSeats === 0 && <span className="text-[0.6rem] text-gray-300 italic px-2 self-center">No seats</span>}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 px-1 opacity-20 group-hover:opacity-100 transition-opacity">
                    <CtrlBtn icon={Plus} onClick={() => updateRow(idx, { rightSeats: rowConfig.rightSeats + 1 })} />
                    <CtrlBtn icon={Minus} onClick={() => updateRow(idx, { rightSeats: rowConfig.rightSeats - 1 })} disabled={rowConfig.rightSeats <= 0} />
                  </div>
                </div>

                {/* Mobile Tier Selector (only shows if wrapped) */}
                <select 
                  className="text-[0.65rem] font-bold uppercase tracking-wider bg-gray-50 border border-gray-200 text-gray-600 rounded px-1.5 py-1 outline-none focus:border-red-400 cursor-pointer w-full mt-2 shrink-0 md:hidden block"
                  value={rowConfig.tier}
                  onChange={(e) => updateRow(idx, { tier: e.target.value })}
                >
                  <option value="recliner">Recliner</option>
                  <option value="premium">Premium</option>
                  <option value="standard">Standard</option>
                </select>

              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-2 shrink-0 border-t border-gray-200 pt-6 mt-6 w-full max-w-lg justify-center">
             <CtrlBtn icon={Plus} onClick={addRowBottom} />
             <div className="text-[0.65rem] font-extrabold text-gray-400 tracking-widest uppercase">Add Row Bottom</div>
             <CtrlBtn icon={Minus} onClick={removeRowBottom} disabled={layout.length <= 1} />
          </div>

          {/* Screen at Bottom */}
          <div className="w-[80%] max-w-[300px] h-2 bg-gradient-to-t from-gray-300 to-gray-200 rounded-full mt-16 shadow-inner mx-auto shrink-0 relative">
             <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center justify-center text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest gap-2 bg-gray-100 px-4 py-1 rounded-full border border-gray-200">
               Screen this side
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex gap-4">
             <div className="flex items-center gap-1.5 text-[0.65rem] font-bold text-gray-600 uppercase tracking-widest"><div className="w-3 h-3 rounded bg-red-500 border border-red-600"/> Recliner</div>
             <div className="flex items-center gap-1.5 text-[0.65rem] font-bold text-gray-600 uppercase tracking-widest"><div className="w-3 h-3 rounded bg-purple-500 border border-purple-600"/> Premium</div>
             <div className="flex items-center gap-1.5 text-[0.65rem] font-bold text-gray-600 uppercase tracking-widest"><div className="w-3 h-3 rounded bg-blue-500 border border-blue-600"/> Standard</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={() => { onSave(layout); onClose(); }} className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 shadow-md transition-colors">
              <Save size={16} /> Save Layout Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VisualTheaterEditor;
