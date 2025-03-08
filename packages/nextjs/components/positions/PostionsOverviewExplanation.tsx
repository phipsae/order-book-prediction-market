export function PostionsOverviewExplanation() {
  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto mb-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Creating a Position</h2>

      <div className="space-y-4 text-base-content">
        <p>
          If you want to mint new tokens because there are no available tokens in your preferred probability range or
          you want to add more liquidity to the prediction market, you can open a new Position.
        </p>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">How to Create a Position:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Choose your preferred outcome (Yes or No)</li>
            <li>Decide on the chance percentage of the outcome you believe in</li>
            <li>Set the amount of ETH you want to invest</li>
          </ol>
        </div>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">What Happens Next:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>When your position is created, other users can see and take it (or also just you)</li>
            <li>Once taken, tokens get minted to both you and the counterparty</li>
            <li>If no one takes your position or you change your mind, you can cancel it</li>
            <li>After a position is taken, you can only sell your tokens to other users in the Offer Overview tab</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
