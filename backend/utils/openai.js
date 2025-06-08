export const generateTextractData = async (lines) => {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-maverick:free",
        messages: [
          {
            role: "system",
            content: `
          You are a JSON-only grocery receipt parser.
          
          From the receipt text below, extract each purchased item as an object with:
          - item (string, default to empty string if missing)
          - quantity (integer, default to 1 if missing)
          - price (string with $, default to "$0.00" if missing)
          
          IMPORTANT INSTRUCTIONS:
          - DO NOT include explanation or intro text.
          - DO NOT wrap the output in triple backticks (no markdown).
          - DO NOT include comments or code samples.
          - ONLY return a valid JSON array.
          - For any missing fields, use the default values specified above.
  
      Respond only with:
      [
        { "item": "Item Name", "quantity": 1, "price": "$X.XX" },
        ...
      ]
          `,
          },
          {
            role: "user",
            content: `Here is the receipt: ${lines.join("\n")}`,
          },
        ],
      }),
    }
  );
  const data = await response.json();
  return data.choices[0].message.content;
};
