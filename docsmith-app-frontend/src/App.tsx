import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Letter {
  deliverAfter: any;
  attachments: any;
  to: any;
  title: string;
  from: string;
  id: string;
  pdfUrl: string;
  recipientAddress: string;
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [address, setAddress] = useState('');
  const [sentLetters, setSentLetters] = useState<Letter[]>([]);
  const [title, setTitle] = useState('');
  const [rtnName, setRtnName] = useState('');
  const [rtnOrganization, setRtnOrganization] = useState('');
  const [rtnAddress1, setRtnAddress1] = useState('');
  const [rtnAddress2, setRtnAddress2] = useState('');
  const [rtnCity, setRtnCity] = useState('');
  const [rtnState, setRtnState] = useState('');
  const [rtnZip, setRtnZip] = useState('');

  useEffect(() => {
    async function fetchSentLetters() {
      try {
        const response = await axios.get('http://localhost:5000/sent-letters');
        setSentLetters(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchSentLetters();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !address || !title) return;

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('recipientAddress', address);
      formData.append('title', title);
      formData.append('rtnName', rtnName);
      formData.append('rtnOrganization', rtnOrganization);
      formData.append('rtnAddress1', rtnAddress1);
      formData.append('rtnAddress2', rtnAddress2);
      formData.append('rtnCity', rtnCity);
      formData.append('rtnState', rtnState);
      formData.append('rtnZip', rtnZip);

      await axios.post('http://localhost:5000/upload', formData);

      setFile(null);
      setAddress('');
      setTitle('');
      setRtnName('');
      setRtnOrganization('');
      setRtnAddress1('');
      setRtnAddress2('');
      setRtnCity('');
      setRtnState('');
      setRtnZip('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Docsmith PDF Printing and Shipping</h1>
      <div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
            <input type="file" onChange={handleFileChange} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', marginRight: '20px' }}>
              <input
                type="text"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
              <input
                type="text"
                name="rtnName"
                value={rtnName}
                onChange={(e) => setRtnName(e.target.value)}
                placeholder="Return Name"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <input
                type="text"
                name="rtnOrganization"
                value={rtnOrganization}
                onChange={(e) => setRtnOrganization(e.target.value)}
                placeholder="Return Organization"
              />
              <input
                type="text"
                name="recipientAddress"
                value={address}
                onChange={handleAddressChange}
                placeholder="Recipient Address"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <input
                type="text"
                name="rtnAddress1"
                value={rtnAddress1}
                onChange={(e) => setRtnAddress1(e.target.value)}
                placeholder="Return Address 1"
              />
              <input
                type="text"
                name="rtnAddress2"
                value={rtnAddress2}
                onChange={(e) => setRtnAddress2(e.target.value)}
                placeholder="Return Address 2"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <input
                type="text"
                name="rtnCity"
                value={rtnCity}
                onChange={(e) => setRtnCity(e.target.value)}
                placeholder="Return City"
              />
              <input
                type="text"
                name="rtnState"
                value={rtnState}
                onChange={(e) => setRtnState(e.target.value)}
                placeholder="Return State"
              />
              <input
                type="text"
                name="rtnZip"
                value={rtnZip}
                onChange={(e) => setRtnZip(e.target.value)}
                placeholder="Return Zip"
              />
            </div>
          </div>
          <button type="submit">Send Letters</button>
        </form>
      </div>
      <div>
        <h2>Sent Letters</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>From</th>
              <th>Title</th>
              <th>To</th>
              <th>Attachments</th>
              <th>Deliver After</th>
            </tr>
          </thead>
          <tbody>
            {sentLetters.map((letter) => (
              <tr key={letter.id}>
                <td>{letter.id}</td>
                <td>{letter.from}</td>
                <td>{letter.title}</td>
                <td>{letter.to.email}</td>
                <td>{letter.attachments}</td>
                <td>{letter.deliverAfter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
