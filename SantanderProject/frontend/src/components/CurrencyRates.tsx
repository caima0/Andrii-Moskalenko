import React, { useState, useEffect } from 'react';
import { currencyService, CurrencyRate } from '../services/api';

const CurrencyRates: React.FC = () => {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [editingRate, setEditingRate] = useState<CurrencyRate | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchRates = async () => {
    try {
      const data = await currencyService.getRates();
      setRates(data);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch currency rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleEdit = (rate: CurrencyRate) => {
    setEditingRate(rate);
  };

  const handleDelete = async (code: string) => {
    if (window.confirm('Are you sure you want to delete this rate?')) {
      try {
        await currencyService.deleteRate(code);
        setRates(rates.filter(rate => rate.code !== code));
        setError('');
      } catch (err: any) {
        setError('Failed to delete rate');
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;

    try {
      const updatedRate = await currencyService.updateRate(editingRate.code, editingRate);
      setRates(rates.map(rate => 
        rate.code === editingRate.code ? updatedRate : rate
      ));
      setEditingRate(null);
      setError('');
    } catch (err: any) {
      setError('Failed to update rate');
    }
  };

  const handleUpdateFromNBP = async () => {
    try {
      setUpdating(true);
      setError('');
      await currencyService.updateRatesFromNBP();
      await fetchRates(); // Refresh the rates after update
    } catch (err: any) {
      setError('Failed to update rates from NBP');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="currency-rates">
      <div className="rates-header">
        <h2>Currency Rates</h2>
        <button 
          onClick={handleUpdateFromNBP} 
          disabled={updating}
          className="update-button"
        >
          {updating ? 'Updating...' : 'Update Rates from NBP'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Currency</th>
            <th>Bid</th>
            <th>Ask</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rates.map(rate => (
            <tr key={rate.code}>
              <td>{rate.code}</td>
              <td>{rate.currency}</td>
              <td>{rate.bid.toFixed(4)}</td>
              <td>{rate.ask.toFixed(4)}</td>
              <td>
                <button onClick={() => handleEdit(rate)}>Edit</button>
                <button onClick={() => handleDelete(rate.code)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingRate && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Edit Rate</h3>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Code:</label>
                <input
                  type="text"
                  value={editingRate.code}
                  onChange={e => setEditingRate({...editingRate, code: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Currency:</label>
                <input
                  type="text"
                  value={editingRate.currency}
                  onChange={e => setEditingRate({...editingRate, currency: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Bid:</label>
                <input
                  type="number"
                  step="0.0001"
                  value={editingRate.bid}
                  onChange={e => setEditingRate({...editingRate, bid: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ask:</label>
                <input
                  type="number"
                  step="0.0001"
                  value={editingRate.ask}
                  onChange={e => setEditingRate({...editingRate, ask: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="button-group">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingRate(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyRates; 