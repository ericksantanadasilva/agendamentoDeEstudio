import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useUser } from '@/contexts/UserContext';

export default function AdminPage() {
  const { currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const onToggleSidebar = () => setIsSidebarOpen(true);
  const onCloseSidebar = () => setIsSidebarOpen(false);

  //buscar usuarios
  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, email, is_admin')
      .order('email');

    if (error) {
      console.error('Erro ao buscar usuário:', error);
    } else {
      setUsers(data);
    }
    setLoadingUsers(false);
  };

  //buscar logs
  const fetchLogs = async () => {
    setLoadingLogs(true);
    const { data, error } = await supabase
      .from('agendamentos_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Erro ao buscar logs:', error);
    } else {
      setLogs(data);
    }
    setLoadingLogs(false);
  };

  //Alterna admin
  const toggleAdmin = async (userId, currentStatus) => {
    const { error } = await supabase
      .from('users')
      .update({ is_admin: !currentStatus })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar admin: ', error);
    } else {
      fetchUsers();
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchLogs();
    }
  }, [currentUser]);

  const formatarData = (dataISO) => {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const formatEventData = (data) => {
    if (!data) return '-';
    return `
🗓  ${formatarData(data.date) || '-'}    
📚 ${data.materia || '-'}  
🎯 ${data.gravacao || '-'}  
👨‍🏫 ${data.professor || '-'}  
🎧 ${data.tecnico || '-'}  
🏢 ${data.studio || '-'}  
📝 ${data.tipo || '-'}  
⏰ ${data.start || '-'} - ${data.end || '-'}
    `.trim();
  };

  const formatEventAction = (data) => {
    const chave = `${data}`;

    const troca = {
      update: 'edição',
      delete: 'cancelamento',
      insert: 'agendamento',
    };

    return troca[chave] || 'erro';
  };

  return (
    <div className='flex h-screen w-full max-w-full overflow-auto'>
      <Sidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      <div className='flex flex-col flex-1'>
        <Header onToggleSidebar={onToggleSidebar} />
        <div className='p-6 space-y-8 bg-gray-50'>
          <h1 className='text-2xl font-bold'>Painel Administrativo</h1>

          {/* Seção Admins */}
          <section className='bg-gray-50 rounded-lg shadow p-4'>
            <h2 className='text-xl font-semibold mb-4'>Gerenciar Admins</h2>
            {loadingUsers ? (
              <p>Carregando usuários...</p>
            ) : (
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='p-2 border'>Email</th>
                    <th className='p-2 border'>Admin</th>
                    <th className='p-2 border'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter((u) => u.id !== currentUser?.id)
                    .map((u) => (
                      <tr key={u.id} className='border-b'>
                        <td className='p-2 border'>{u.email}</td>
                        <td className='p-2 border'>
                          {u.is_admin ? 'Sim' : 'Não'}
                        </td>
                        <td className='p-2 border'>
                          <button
                            onClick={() => toggleAdmin(u.id, u.is_admin)}
                            className={`px-3 py-1 rounded text-white cursor-pointer ${
                              u.is_admin ? 'bg-red-500' : 'bg-green-500'
                            }`}
                          >
                            {u.is_admin ? 'Remover Admin' : 'Tornar Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Seção logs */}
          <section className='bg-gray-50 rounded-lg shadow p-4'>
            <h2 className='text-xl font-semibold mb-4'>Log de Alterações</h2>
            {loadingLogs ? (
              <p>Carregando logs...</p>
            ) : (
              <table className='w-full border-collapse text-sm'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='p-2 border'>Data</th>
                    <th className='p-2 border'>Ação</th>
                    <th className='p-2 border'>Por</th>
                    <th className='p-2 border'>Antes</th>
                    <th className='p-2 border'>Depois</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className='border-b'>
                      <td className='p-2 border'>
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className='p-2 border'>
                        {formatEventAction(log.acao)}
                      </td>
                      <td className='p-2 border'>{log.alterado_por_email}</td>
                      <td className='p-2 border'>
                        <pre className='whitespace-pre-wrap'>
                          {formatEventData(log.dados_anteriores)}
                        </pre>
                      </td>
                      <td className='p-2 border'>
                        <pre className='whitespace-pre-wrap'>
                          {formatEventData(log.dados_novos)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
