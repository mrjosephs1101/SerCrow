import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdvancedSearchProps {
  onSearch: (query: string) => void;
}

export function AdvancedSearch({ onSearch }: AdvancedSearchProps) {
  const [allWords, setAllWords] = useState('');
  const [exactPhrase, setExactPhrase] = useState('');
  const [anyWords, setAnyWords] = useState('');
  const [noneWords, setNoneWords] = useState('');
  const [site, setSite] = useState('');
  const [fileType, setFileType] = useState('all');

  const handleSearch = () => {
    let query = '';
    if (allWords) query += `${allWords} `;
    if (exactPhrase) query += `"${exactPhrase}" `;
    if (anyWords) query += `(${anyWords.split(' ').join(' OR ')}) `;
    if (noneWords) query += `${noneWords.split(' ').map(w => `-${w}`).join(' ')} `;
    if (site) query += `site:${site} `;
    if (fileType !== 'all') query += `filetype:${fileType}`;
    onSearch(query.trim());
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4">Advanced Search</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="all-words">All these words</Label>
          <Input id="all-words" name="all-words" value={allWords} onChange={(e) => setAllWords(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="exact-phrase">This exact word or phrase</Label>
          <Input id="exact-phrase" name="exact-phrase" value={exactPhrase} onChange={(e) => setExactPhrase(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="any-words">Any of these words</Label>
          <Input id="any-words" name="any-words" value={anyWords} onChange={(e) => setAnyWords(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="none-words">None of these words</Label>
          <Input id="none-words" name="none-words" value={noneWords} onChange={(e) => setNoneWords(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="site">Site</Label>
          <Input id="site" name="site" value={site} onChange={(e) => setSite(e.target.value)} placeholder="e.g., Google.com" />
        </div>
        <div>
          <Label htmlFor="file-type">File type</Label>
          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger id="file-type">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="doc">DOC</SelectItem>
              <SelectItem value="xls">XLS</SelectItem>
              <SelectItem value="ppt">PPT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleSearch}>Advanced Search</Button>
      </div>
    </div>
  );
}

