export function PositionsOverviewExplanation() {
  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto mb-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Creating and Taking a Position</h2>

      <div className="space-y-4 text-base-content">
        <p>
          If there are currently no tokens available, none within your desired probability range, or you simply wish to
          add liquidity to the market, you can mint new tokens by opening a new position.
        </p>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">How to Create a Position:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Choose your preferred expected result (Yes or No)</li>
            <li>Decide on the chance percentage of the result you believe in</li>
            <li>Set the amount of ETH you want to invest</li>
          </ol>
        </div>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">What Happens Next:</h3>
          <ul className="list-disc list-outside space-y-1 pl-5">
            <li>
              Once your position is created, other users can view and accept it (you can also accept your own position).
            </li>
            <li>
              When a position is accepted, new tokens are minted for both parties. For example, if you choose
              &quot;Yes,&quot; you will receive &quot;Yes&quot; tokens, while your counterparty will receive the same
              amount of &quot;No&quot; tokens.
            </li>
            <li>
              If no one accepts your position or you change your mind, you can cancel the position and retrieve your
              ETH.
            </li>
            <li>
              After a position is accepted, tokens can only be traded with other users in the Offer Overview tab. (Note
              that there is currently no burn feature to remove tokens and withdraw liquidity from active markets.)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
