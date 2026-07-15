import { useMemo, useState, type ChangeEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { studyApi } from '../../api/endpoints/study.api';
import { treesApi } from '../../api/endpoints/topic-trees.api';
import { queriesApi } from '../../api/endpoints/queries.api';
import type { PronunciationAttempt, StudyCompletion, StudyMode, StudySession, TopicNode } from '../../api/types';
import { problemMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { InlineNotice, Select } from '../../components/common/FormControls';

const modes: Array<{ value: StudyMode; label: string; description: string }> = [
  { value: 'FLASHCARD', label: 'Flashcard', description: 'Tự đánh giá mức độ nhớ.' },
  { value: 'PRONUNCIATION', label: 'Pronunciation', description: 'Tải bản ghi âm và nhận điểm.' },
  { value: 'VI_TO_EN', label: 'Việt → Anh', description: 'Nhập từ tiếng Anh.' },
  { value: 'EN_TO_VI', label: 'Anh → Việt', description: 'Nhập nghĩa tiếng Việt.' },
  { value: 'LISTEN_EN_WRITE_EN', label: 'Nghe Anh → viết Anh', description: 'Nghe và chép chính tả.' },
  { value: 'LISTEN_EN_WRITE_VI', label: 'Nghe Anh → viết Việt', description: 'Nghe và nhập nghĩa.' },
  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm', description: 'Chọn một đáp án.' }
];

export default function Study() {
  const [mode, setMode] = useState<StudyMode>('EN_TO_VI');
  const [sourceType, setSourceType] = useState<'TOPIC_NODE' | 'SAVED_QUERY' | 'WRONG_ANSWERS'>('TOPIC_NODE');
  const [treeId, setTreeId] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [limit, setLimit] = useState(10);
  const [shuffle, setShuffle] = useState(true);
  const [session, setSession] = useState<StudySession | null>(null);
  const [resumeId, setResumeId] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [completion, setCompletion] = useState<StudyCompletion | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [attempt, setAttempt] = useState<PronunciationAttempt | null>(null);

  const trees = useQuery({ queryKey: ['trees', 'study'], queryFn: () => treesApi.list({ page_size: 100 }) });
  const nodes = useQuery({ queryKey: ['study-nodes', treeId], queryFn: () => treesApi.search(treeId, { q: '', limit: 100 }), enabled: Boolean(treeId) });
  const savedQueries = useQuery({ queryKey: ['saved-queries', 'study'], queryFn: () => queriesApi.list({ page_size: 100 }) });
  const vocabularyNodes = useMemo(() => (nodes.data?.matches ?? []).filter((node) => node.node_type === 'VOCABULARY' || node.vocabulary_count > 0), [nodes.data]);

  const createSession = useMutation({
    mutationFn: () => studyApi.create({ mode, source: { type: sourceType, id: sourceType === 'WRONG_ANSWERS' ? (sourceId || treeId) : sourceId }, limit, shuffle }),
    onSuccess: (created) => { setSession(created); setCompletion(null); setFeedback(''); setError(''); setResumeId(created.id); },
    onError: (reason) => setError(problemMessage(reason))
  });
  const resume = useMutation({ mutationFn: () => studyApi.get(resumeId), onSuccess: (loaded) => { setSession(loaded); setError(''); }, onError: (reason) => setError(problemMessage(reason)) });
  const submit = useMutation({
    mutationFn: (value: string) => studyApi.answer(session!.id, { item_id: session!.current_item!.id, answer: { value }, response_ms: 1000 }),
    onSuccess: (result) => { setFeedback(result.correct ? 'Chính xác! 🎉' : `Chưa đúng. Đáp án: ${result.feedback.expected}`); setSession(result.session); setAnswer(''); setAudio(null); },
    onError: (reason) => setError(problemMessage(reason))
  });
  const complete = useMutation({ mutationFn: () => studyApi.complete(session!.id), onSuccess: (result) => { setCompletion(result); setSession((current) => current ? { ...current, status: 'COMPLETED' } : current); }, onError: (reason) => setError(problemMessage(reason)) });
  const uploadPronunciation = useMutation({
    mutationFn: () => studyApi.pronunciation(session!.current_item!.concept_id, audio!),
    onSuccess: async (created) => { setAttempt(await studyApi.pronunciationAttempt(created.id)); await submit.mutateAsync(session!.current_item!.prompt.vietnamese); },
    onError: (reason) => setError(problemMessage(reason))
  });
  const reloadAttempt = useMutation({ mutationFn: () => studyApi.pronunciationAttempt(attempt!.id), onSuccess: setAttempt, onError: (reason) => setError(problemMessage(reason)) });

  const canStart = sourceType === 'WRONG_ANSWERS' ? Boolean(sourceId || treeId) : Boolean(sourceId);
  const current = session?.current_item;

  function chooseTree(value: string) {
    setTreeId(value); setSourceId('');
  }

  return <div><div className="page-title"><div><h1>Luyện tập</h1><p>Đầy đủ bảy Study Mode, resume session, complete và pronunciation scoring.</p></div>{session && <Badge tone={session.status === 'ACTIVE' ? 'info' : 'success'}>{session.status}</Badge>}</div>{error && <InlineNotice tone="error">{error}</InlineNotice>}{!session ? <div className="study-config"><section className="panel"><h2>1. Chọn chế độ</h2><div className="mode-grid">{modes.map((item) => <button type="button" key={item.value} className={mode === item.value ? 'active' : ''} onClick={() => setMode(item.value)}><strong>{item.label}</strong><span>{item.description}</span></button>)}</div></section><section className="panel"><h2>2. Chọn nguồn học</h2><div className="form-grid"><Select label="Nguồn" value={sourceType} onChange={(event) => { setSourceType(event.target.value as typeof sourceType); setSourceId(''); }}><option value="TOPIC_NODE">Topic Node</option><option value="SAVED_QUERY">Saved Query</option><option value="WRONG_ANSWERS">Wrong answers</option></Select>{sourceType !== 'SAVED_QUERY' && <Select label="Topic Tree" value={treeId} onChange={(event) => chooseTree(event.target.value)}><option value="">Chọn cây</option>{trees.data?.items.map((tree) => <option key={tree.id} value={tree.id}>{tree.display_name}</option>)}</Select>}{sourceType === 'TOPIC_NODE' && <Select label="Topic Node" value={sourceId} onChange={(event) => setSourceId(event.target.value)} disabled={!treeId}><option value="">Chọn nguồn từ vựng</option>{vocabularyNodes.map((node: TopicNode) => <option key={node.id} value={node.id}>{node.path_text} · {node.vocabulary_count} từ</option>)}</Select>}{sourceType === 'SAVED_QUERY' && <Select label="Saved Query" value={sourceId} onChange={(event) => setSourceId(event.target.value)}><option value="">Chọn Query</option>{savedQueries.data?.items.map((item) => <option key={item.id} value={item.id}>{item.display_name} · {item.result_count} từ</option>)}</Select>}{sourceType === 'WRONG_ANSWERS' && <Input label="Source UUID" placeholder="Có thể dùng Tree ID demo" value={sourceId} onChange={(event) => setSourceId(event.target.value)} />}<Input label="Số câu" type="number" min={1} max={100} value={limit} onChange={(event) => setLimit(Number(event.target.value))} /><label className="check-field"><input type="checkbox" checked={shuffle} onChange={(event) => setShuffle(event.target.checked)} /> Xáo trộn câu hỏi</label></div><Button onClick={() => createSession.mutate()} disabled={!canStart || createSession.isPending}>{createSession.isPending ? 'Đang tạo phiên…' : 'Bắt đầu phiên học'}</Button></section><section className="panel resume-panel"><h2>Tiếp tục bằng Session ID</h2><div className="inline-form"><Input placeholder="Study Session ID" value={resumeId} onChange={(event) => setResumeId(event.target.value)} /><Button variant="secondary" disabled={!resumeId || resume.isPending} onClick={() => resume.mutate()}>Tải phiên</Button></div></section></div> : completion ? <CompletionView completion={completion} onRestart={() => { setSession(null); setCompletion(null); setAttempt(null); }} /> : <section className="study-player"><div className="study-progress"><span style={{ width: `${(session.current_index / session.total_items) * 100}%` }} /></div><div className="study-index">Câu {Math.min(session.current_index + 1, session.total_items)}/{session.total_items} · Đúng {session.correct_count}</div>{current ? <><article className="flashcard"><small>{modes.find((item) => item.value === session.mode)?.label}</small><h2>{current.prompt.text}</h2><p>{current.prompt.pronunciation}</p>{current.audio_url && <audio controls src={current.audio_url} />}</article>{current.answer_type === 'SELF_RATE' && <div className="rating-grid">{['AGAIN', 'HARD', 'GOOD', 'EASY'].map((value) => <Button key={value} variant={value === 'GOOD' || value === 'EASY' ? 'primary' : 'secondary'} onClick={() => submit.mutate(value)}>{value}</Button>)}</div>}{current.answer_type === 'CHOICE' && <div className="choice-grid">{current.choices.map((choice) => <Button key={choice.id} variant="secondary" onClick={() => submit.mutate(choice.label)}>{choice.label}</Button>)}</div>}{current.answer_type === 'TEXT' && <><Input placeholder="Nhập câu trả lời…" value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && answer) submit.mutate(answer); }} /><Button disabled={!answer || submit.isPending} onClick={() => submit.mutate(answer)}>Kiểm tra</Button></>}{current.answer_type === 'AUDIO' && <div className="pronunciation-box"><label className="file-drop compact"><input type="file" accept="audio/*" onChange={(event: ChangeEvent<HTMLInputElement>) => setAudio(event.target.files?.[0] ?? null)} /><span>🎙️</span><strong>{audio?.name ?? 'Chọn file ghi âm'}</strong></label><Button disabled={!audio || uploadPronunciation.isPending} onClick={() => uploadPronunciation.mutate()}>{uploadPronunciation.isPending ? 'Đang chấm điểm…' : 'Gửi bản ghi âm'}</Button>{attempt && <div className="score-card"><div><strong>{String(attempt.scores?.overall ?? '—')}</strong><span>Overall</span></div><pre>{JSON.stringify(attempt.feedback, null, 2)}</pre><Button variant="ghost" onClick={() => reloadAttempt.mutate()}>Làm mới kết quả</Button></div>}</div>}{feedback && <div className={`study-feedback ${feedback.startsWith('Chính') ? '' : 'wrong'}`}>{feedback}</div>}<Button variant="ghost" onClick={() => complete.mutate()}>Kết thúc sớm</Button></> : <div className="study-start"><div className="study-illustration">🏁</div><h2>Đã trả lời hết câu hỏi</h2><Button onClick={() => complete.mutate()} disabled={complete.isPending}>Xem kết quả</Button></div>}</section>}</div>;
}

function CompletionView({ completion, onRestart }: { completion: StudyCompletion; onRestart: () => void }) {
  return <section className="study-start"><div className="study-illustration">🏆</div><h2>Hoàn thành phiên học</h2><p>Độ chính xác {Math.round(completion.accuracy * 100)}% · +{completion.xp_earned} XP</p><div className="stats-grid mini"><article><strong>{completion.correct_count}</strong><small>Đúng</small></article><article><strong>{completion.total_items - completion.correct_count}</strong><small>Sai</small></article><article><strong>{completion.streak_days}</strong><small>Streak</small></article></div>{completion.wrong_concept_ids.length > 0 && <details><summary>{completion.wrong_concept_ids.length} concept cần ôn lại</summary><pre className="json-block">{JSON.stringify(completion.wrong_concept_ids, null, 2)}</pre></details>}<Button onClick={onRestart}>Tạo phiên học khác</Button></section>;
}
