import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vocabularyApi } from '../../api/endpoints/vocabulary.api';
import { useDebounce } from '../../hooks/useDebounce';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export default function VocabularySearch() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const query = useDebounce(search, 250);
  const vocabulary = useQuery({
    queryKey: ['vocabulary-search', query],
    queryFn: () => vocabularyApi.search({ q: query, page_size: 100 })
  });
  const detail = useQuery({
    queryKey: ['vocabulary-detail', selectedId],
    queryFn: () => vocabularyApi.get(selectedId),
    enabled: Boolean(selectedId)
  });

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Từ vựng toàn hệ thống</h1>
          <p>Tìm trên tất cả cây bạn sở hữu hoặc được chia sẻ.</p>
        </div>
      </div>
      <div className="toolbar">
        <Input
          placeholder="Tìm English, Vietnamese, example…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <span>{vocabulary.data?.meta.total_items ?? 0} kết quả</span>
      </div>
      {vocabulary.isLoading ? (
        <Spinner />
      ) : vocabulary.data?.items.length ? (
        <div className="data-table">
          <div className="data-row data-head vocabulary-search-data">
            <span>English</span><span>Vietnamese</span><span>Loại từ</span><span>Trạng thái</span><span />
          </div>
          {vocabulary.data.items.map((item) => (
            <div className="data-row vocabulary-search-data" key={item.id}>
              <div><strong>{item.english}</strong><small>{item.pronunciation}</small></div>
              <span>{item.vietnamese}</span>
              <span>{item.part_of_speech ?? 'OTHER'}</span>
              <Badge tone="info">{item.learning_status}</Badge>
              <Button variant="ghost" onClick={() => setSelectedId(item.id)}>Chi tiết</Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Không có từ phù hợp" description="Thử từ khóa khác hoặc thêm từ vào Topic Tree." />
      )}

      <Modal title="Chi tiết từ vựng" open={Boolean(selectedId)} onClose={() => setSelectedId('')}>
        {detail.isLoading ? <Spinner /> : detail.data && (
          <div className="vocabulary-detail">
            <div className="page-title compact"><div><h2>{detail.data.english}</h2><p>{detail.data.pronunciation || 'Chưa có phát âm'}</p></div><Badge tone="info">{detail.data.part_of_speech || 'OTHER'}</Badge></div>
            <dl className="detail-list">
              <div><dt>Tiếng Việt</dt><dd>{detail.data.vietnamese}</dd></div>
              <div><dt>Ví dụ</dt><dd>{detail.data.example || '—'}</dd></div>
              <div><dt>Trạng thái học</dt><dd>{detail.data.learning_status}</dd></div>
              <div><dt>Version</dt><dd>{detail.data.version}</dd></div>
            </dl>
            {detail.data.image_url && <img className="vocabulary-image" src={detail.data.image_url} alt={detail.data.english} />}
          </div>
        )}
      </Modal>
    </div>
  );
}
