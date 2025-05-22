import React, { useState } from 'react';
import Layout from './components/Layout';
import Logo from './images/logo.png';

function App() {
  const [userText, setUserText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!userText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const res = await fetch('https://cognition-backend.onrender.com/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article: userText }),
      });

      const data = await res.json();

      setOutput({
        summary: data.summary,
        key_points: data.key_points,
        reflection_questions: data.reflection_questions,
      });
    } catch (err) {
      console.error(err);
      setOutput({ summary: "Error: AI agent didn't respond. Try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <img src={Logo} alt="Logo" width="100" className="centered-logo" />
      <p>Please paste or drag and drop the text you want summarized in the box below:</p>

      <textarea
        className="prompt-input"
        placeholder="Enter your text here to summarize..."
        value={userText}
        onChange={(e) => setUserText(e.target.value)}
      />

      <p></p>
      <button className="summarize-button" onClick={handleSummarize}>
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {output && (
        <div className="output-box">


          {output.key_points && (
            <>
              <h4>Key Points:</h4>
              <ul>
                {output.key_points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </>
          )}

          {output.reflection_questions && (
            <>
              <h4>Reflection Questions:</h4>
              <ol>
                {output.reflection_questions.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </Layout>
  );
}

export default App;
