import Folha from './Folha'
import { Segmentos } from './Pecas'
import { FAMILIAS } from '../lib/model'
import { ORDENS } from '../lib/filtros'

export default function Filtros({ aberta, onFechar, f, setF, paises, total, onLimpar }) {
  const set = (k, v) => setF({ ...f, [k]: v })
  return (
    <Folha aberta={aberta} onFechar={onFechar} titulo="Filtros" largura={520}>
      <div className="filtros">
        <h3>Filtros</h3>
        <label>Onde
          <Segmentos valor={f.pais === 'Portugal' || f.pais === 'Estrangeiro' ? f.pais : f.pais === 'todos' ? 'todos' : 'outro'}
            onChange={(v) => set('pais', v)} opcoes={[['todos', 'Todas'], ['Portugal', 'Portugal'], ['Estrangeiro', 'Estrangeiro']]} />
        </label>
        <label>País
          <select value={f.pais} onChange={(e) => set('pais', e.target.value)}>
            <option value="todos">Todos</option>
            {paises.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label>Área
          <select value={f.familia} onChange={(e) => set('familia', e.target.value)}>
            <option value="todas">Todas</option>
            {FAMILIAS.map(([n]) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <label>Veredicto do modelo
          <select value={f.veredicto} onChange={(e) => set('veredicto', e.target.value)}>
            <option value="todos">Todos</option>
            <option>Prioridade</option>
            <option>Candidatar (reach)</option>
            <option>Reserva</option>
          </select>
        </label>
        <label>Ordenar por
          <select value={f.ordem} onChange={(e) => set('ordem', e.target.value)}>
            {ORDENS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
          </select>
        </label>
        <label className="interruptor">
          <input type="checkbox" checked={f.incluirInativas} onChange={(e) => set('incluirInativas', e.target.checked)} />
          <span>Incluir vagas por abrir ou expiradas</span>
        </label>
        <div className="filtros-rodape">
          <button className="btn" onClick={onLimpar}>Limpar</button>
          <button className="btn primario" onClick={onFechar}>Ver {total} vagas</button>
        </div>
      </div>
    </Folha>
  )
}
