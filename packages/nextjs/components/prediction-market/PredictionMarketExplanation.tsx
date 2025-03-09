export function PredictionMarketExplanation() {
  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto mb-6">
      <h2 className="text-2xl font-bold mb-4 text-center">How This Prediction Market Works</h2>

      <div className="space-y-4 text-base-content">
        <p>
          This is an order-book-based prediction market, where trades are settled exclusively when matched with a
          counterparty.
        </p>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">What is a Prediction Market?</h3>
          <p>
            A prediction market allows participants to bet on the outcomes of future events by buying and selling shares
            based on their expectations. The market price of these shares reflects the collective estimate of the
            likelihood that an event will occur.
          </p>
        </div>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">How it works:</h3>
          <ul className="list-decimal list-inside space-y-2">
            <p>There are two ways to participate in the prediction market:</p>
            <li>
              <strong>Positions:</strong> You find a counterparty who takes the opposite side of your prediction. Once
              matched, new tokens are minted for both parties. This step must occur first; otherwise, no tokens would be
              available for trading. tokens are minted for both parties. This step must occur first; otherwise, no
              tokens would be available for trading.
            </li>
            <li>
              <strong>Offers:</strong> You directly buy or sell existing tokens from other users. After tokens have been
              minted through positions, users can freely trade these tokens with each other.
            </li>
          </ul>
        </div>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              To mint new trading tokens, visit the{" "}
              <a href="/positions-overview" className="text-primary hover:underline">
                positions overview tab
              </a>{" "}
              and create a position by choosing your predicted outcome (Yes/No) and the amount you&apos;d like to
              invest. This will lead to a minting of new tokens and increase the total token supply for both tokens.
            </li>
            <li>
              If you already own tokens (e.g. from the step before), you can sell them or explore existing offers from
              other users in the{" "}
              <a href="/offers-overview" className="text-primary hover:underline">
                offers overview tab
              </a>
              . Trading existing tokens does not change the overall token supply—it simply transfers tokens between
              users. But you could also create a ask for a token and wait for a buyer to sell them to you (therefor you
              dont need to have tokens).
            </li>
            <li>
              If you control the oracle address, you can resolve the prediction market and finalize outcomes, so that
              people can redeem the winning tokens.
            </li>
          </ol>
        </div>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Key Features:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Token Creation and therefor provide liqudity into the market</li>
            <li>Order-book mechanism for trading tokens before resolution</li>
            <li>Simple orcale integration to resolve the prediction market</li>
          </ul>
        </div>
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Missing Features:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Real order-book functionality with sorting and caculate probability</li>
            <li>Reduce Supply of tokens via burning</li>
            <li>Real oracle integration</li>
            <li>Redeem winning token after resolution</li>
            <li>No fee/revenue accural for the prediction market</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
