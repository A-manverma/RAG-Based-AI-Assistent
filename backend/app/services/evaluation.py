import logging
from typing import List, Dict
import time
from nltk.translate.bleu_score import sentence_bleu

# In an actual production setup, ragas.metrics would be evaluated offline 
# or pushed to a telemetry provider like Langfuse or Datadog.
# We build an in-memory EvaluationLogger here to fulfill the Analytics Dashboard requirement.

logger = logging.getLogger(__name__)

def compute_bleu_score(reference: str, hypothesis: str) -> float:
    """Computes BLEU score for exact match baselining against ground truths."""
    ref_tokens = [reference.lower().split()]
    hyp_tokens = hypothesis.lower().split()
    try:
        # Weights for unigrams
        score = sentence_bleu(ref_tokens, hyp_tokens, weights=(1, 0, 0, 0))
        return score
    except Exception as e:
        logger.error(f"Error computing BLEU score: {e}")
        return 0.0

class EvaluationLogger:
    """Simulates a telemetry/evaluation logger for RAG traces."""
    def __init__(self):
        self.traces = []

    def log_trace(
        self, 
        query: str, 
        contexts: List[str], 
        answer: str, 
        ground_truth: str = None, 
        latency_ms: float = 0.0
    ):
        """
        Logs a full RAG trace. 
        In production, this is inserted into PostgreSQL for offline RAGAS analysis.
        """
        bleu = compute_bleu_score(ground_truth, answer) if ground_truth else None
        
        trace = {
            "query": query,
            "contexts": contexts,
            "answer": answer,
            "latency_ms": latency_ms,
            "bleu_score": bleu,
            "timestamp": time.time()
        }
        self.traces.append(trace)
        logger.info(f"Trace logged. Latency: {latency_ms}ms")
        
    def get_dashboard_metrics(self) -> Dict:
        """Aggregates metrics for the admin dashboard based on stored traces."""
        if not self.traces:
            return {"total_queries": 0, "avg_latency_ms": 0, "avg_bleu": 0.0}
            
        avg_lat = sum(t["latency_ms"] for t in self.traces) / len(self.traces)
        
        bleu_traces = [t["bleu_score"] for t in self.traces if t["bleu_score"] is not None]
        avg_bleu = sum(bleu_traces) / len(bleu_traces) if bleu_traces else 0.0
        
        return {
            "total_queries": len(self.traces),
            "avg_latency_ms": round(avg_lat, 2),
            "avg_bleu": round(avg_bleu, 4)
        }

# Global singleton for prototype Phase 6
eval_logger = EvaluationLogger()
