// nodeTypes must be defined at module scope (stable reference — never inside a component)
import InicioNode from './InicioNode'
import MensagemNode from './MensagemNode'
import AgenteIANode from './AgenteIANode'
import ColetarDadoNode from './ColetarDadoNode'
import CondicaoNode from './CondicaoNode'
import RoteamentoNode from './RoteamentoNode'
import HumanoNode from './HumanoNode'
import FinalizarNode from './FinalizarNode'

export const nodeTypes = {
  inicio: InicioNode,
  mensagem: MensagemNode,
  agente_ia: AgenteIANode,
  coletar_dado: ColetarDadoNode,
  condicao: CondicaoNode,
  roteamento: RoteamentoNode,
  humano: HumanoNode,
  finalizar: FinalizarNode,
}
