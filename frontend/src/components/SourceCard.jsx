
import { FileText, ExternalLink } from "lucide-react";

export default function SourceCard({ source }) {
  const similarity = Number(source.similarity);

  return (
    <div className="source-card">

      <div className="source-icon">
        <FileText size={17} />
      </div>

      <div className="source-info">
        <strong>{source.documentName}</strong>

        <span>
          Chunk {source.chunkIndex}
          {" · "}
          Similarity: {
            Number.isFinite(similarity)
              ? `${(similarity * 100).toFixed(1)}%`
              : "N/A"
          }
        </span>
      </div>

      <ExternalLink
        size={15}
        className="source-external"
      />

    </div>
  );
}
