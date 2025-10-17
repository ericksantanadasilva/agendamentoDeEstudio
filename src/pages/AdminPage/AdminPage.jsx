import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useUser } from '@/contexts/UserContext';
import { Switch } from '@/components/ui/switch';

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
      .select('id, email, is_admin, is_management')
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

  const toggleManagement = async (userId, currentStatus) => {
    const { error } = await supabase
      .from('users')
      .update({ is_management: !currentStatus })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar gerência:', error);
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
            <h2 className='text-xl font-semibold mb-4'>
              Gerenciar permissões dos usuários
            </h2>
            {loadingUsers ? (
              <p>Carregando usuários...</p>
            ) : (
              <div className='space-y-3'>
                {users
                  .filter((u) => u.id !== currentUser?.id)
                  .map((u) => (
                    <div
                      key={u.id}
                      className='flex items-center justify-between border rounded-lg p-3 bg-white shadow-sm'
                    >
                      <div className='text-gray-700 font-medium'>{u.email}</div>
                      <div className='flex items-center space-x-6'>
                        {/* Switch Admin */}
                        <div className='flex items-center space-x-2'>
                          <Switch
                            checked={u.is_admin}
                            onCheckedChange={() =>
                              toggleAdmin(u.id, u.is_admin)
                            }
                            className={
                              u.is_admin
                                ? 'data-[state=checked]:bg-green-500'
                                : ''
                            }
                          />
                          <span className='text-sm text-gray-600'>Admin</span>
                        </div>

                        {/* Switch Gerência */}
                        <div className='flex items-center space-x-2'>
                          <Switch
                            checked={u.is_management}
                            onCheckedChange={() =>
                              toggleManagement(u.id, u.is_management)
                            }
                            className={
                              u.is_management
                                ? 'data-[state=checked]:bg-blue-500'
                                : ''
                            }
                          />
                          <span className='text-sm text-gray-600'>
                            Gerência
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
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
