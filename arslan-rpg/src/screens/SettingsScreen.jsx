import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import Modal from '../components/ui/Modal';
import { OrnamentDivider } from '../components/ui/Ornament';
import styles from './SettingsScreen.module.css';

export default function SettingsScreen() {
    const navigate = useNavigate();
    const resetGame = useGameStore((s) => s.resetGame);
    const setGamePhase = useGameStore((s) => s.setGamePhase);
    const store = useGameStore();

    const [textSpeed, setTextSpeed] = useState(
        () => localStorage.getItem('arslan_text_speed') || 'normal'
    );
    const [showResetModal, setShowResetModal] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    const saveInfo = store.getSaveInfo();

    const handleSaveSlot = (slot) => {
        store.saveToSlot(slot);
        setSaveMsg(`Salvo no Slot ${slot}.`);
        setTimeout(() => setSaveMsg(''), 2500);
    };

    const handleLoadSlot = (slot) => {
        const ok = store.loadFromSlot(slot);
        setSaveMsg(ok ? `Slot ${slot} carregado.` : `Slot ${slot} vazio.`);
        if (ok) { setTimeout(() => { navigate('/'); }, 800); }
        else setTimeout(() => setSaveMsg(''), 2500);
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const handleTextSpeed = (speed) => {
        setTextSpeed(speed);
        localStorage.setItem('arslan_text_speed', speed);
    };

    const handleReset = () => {
        resetGame();
        setGamePhase('title');
        setShowResetModal(false);
        navigate('/');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Configuracoes</h1>
                <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Voltar</Button>
            </div>
            <OrnamentDivider />

            <Panel title="Velocidade do Texto">
                <div className={styles.speedOptions}>
                    {[
                        { id: 'slow', label: 'Lenta' },
                        { id: 'normal', label: 'Normal' },
                        { id: 'fast', label: 'Rapida' },
                        { id: 'instant', label: 'Instantanea' },
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            className={`${styles.speedBtn} ${textSpeed === opt.id ? styles.speedActive : ''}`}
                            onClick={() => handleTextSpeed(opt.id)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </Panel>

            <Panel title="Saves">
                {saveMsg && <p className={styles.saveMsg}>{saveMsg}</p>}
                <div className={styles.slotsGrid}>
                    {['1', '2', '3'].map((slot) => (
                        <div key={slot} className={styles.slotRow}>
                            <div className={styles.slotInfo}>
                                <span className={styles.slotLabel}>Slot {slot}</span>
                                {saveInfo[slot]
                                    ? <span className={styles.slotMeta}>Ato {saveInfo[slot].act} · Nv.{saveInfo[slot].playerLevel} · {formatTime(saveInfo[slot].timestamp)}</span>
                                    : <span className={styles.slotEmpty}>Vazio</span>
                                }
                            </div>
                            <div className={styles.slotActions}>
                                <Button variant="gold" size="sm" onClick={() => handleSaveSlot(slot)}>Salvar</Button>
                                <Button variant="secondary" size="sm" onClick={() => handleLoadSlot(slot)} disabled={!saveInfo[slot]}>Carregar</Button>
                            </div>
                        </div>
                    ))}
                </div>
                {saveInfo.auto && (
                    <div className={styles.autosaveRow}>
                        <span className={styles.slotMeta}>Autosave: Ato {saveInfo.auto.act} · {formatTime(saveInfo.auto.timestamp)}</span>
                        <Button variant="secondary" size="sm" onClick={() => handleLoadSlot('auto')}>Carregar</Button>
                    </div>
                )}
            </Panel>

            <Panel title="Dados do Jogo">
                <p className={styles.warning}>
                    Resetar o save apaga todo o progresso permanentemente.
                </p>
                <Button variant="primary" size="md" onClick={() => setShowResetModal(true)}>
                    🗑 Resetar Save
                </Button>
            </Panel>

            <Panel title="Creditos">
                <div className={styles.credits}>
                    <p>Baseado no manga/anime <strong>Arslan Senki</strong></p>
                    <p>de Yoshiki Tanaka e Hiromu Arakawa</p>
                    <OrnamentDivider />
                    <p className={styles.creditsMuted}>Desenvolvido com React + Zustand</p>
                    <p className={styles.creditsMuted}>Versao 1.0.0</p>
                </div>
            </Panel>

            {showResetModal && (
                <Modal onClose={() => setShowResetModal(false)}>
                    <h3 className={styles.modalTitle}>Tem certeza?</h3>
                    <p className={styles.modalText}>
                        Todo seu progresso sera perdido. Esta acao nao pode ser desfeita.
                    </p>
                    <div className={styles.modalActions}>
                        <Button variant="primary" size="md" onClick={handleReset}>
                            Sim, Resetar
                        </Button>
                        <Button variant="secondary" size="md" onClick={() => setShowResetModal(false)}>
                            Cancelar
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
