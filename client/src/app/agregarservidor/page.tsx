'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@/lib/hooks/useTranslation';
import SearchBar from '@/components/search/search-bar';
import { addServer } from '@/lib/api/servers';

export default function AddServerPage() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [selectedValue, setSelectedValue] = useState('0');
  const [searchValue, setSearchValue] = useState('');
  const [formData, setFormData] = useState({
    host: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState('');
  const [responseColor, setResponseColor] = useState(false);
  const [countdown, setCountdown] = useState(-1);
  const [savedAddress, setSavedAddress] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (responseStatus && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      router.push(`/servidor/${savedAddress}`);
    }
    
    return () => clearInterval(timer);
  }, [responseStatus, countdown, router, savedAddress]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddServer = async () => {
    if (isLoading) return;

    // Validate input format (IP:Port)
    if (!formData.host || !/^[\w.-]+:\d+$/.test(formData.host.trim())) {
      setResponseStatus(t('completeFieldsCorrectly'));
      setResponseColor(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await addServer(formData);

      if (response === 'fail') {
        setResponseStatus(t('invalidIpOrPort'));
        setResponseColor(false);
      } else if (response === 'duplicated') {
        setResponseStatus(t('serverAlreadyInDatabase'));
        setResponseColor(false);
      } else {
        setFormData({
          host: '',
        });
        setResponseStatus(t('serverAddedSuccessfully'));
        setResponseColor(true);
        setSavedAddress(`${response.host}:${response.port}`);
        setCountdown(10);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseStatus(t('errorAddingServer'));
      setResponseColor(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center">
      <SearchBar 
        initialSelectedValue={selectedValue}
        initialSearchValue={searchValue}
      />
      
      <div className="w-[95%] md:w-1/2 bg-black bg-opacity-80 rounded">
        <div className="bg-black bg-opacity-70 border border-black border-opacity-70 px-7 py-2 relative z-10 flex justify-between items-center">
          <div className="uppercase text-amber-400 text-base font-semibold">
            {t('addServer')}
          </div>
          
          {countdown > 0 && (
            <div className="text-green-500 text-xs font-semibold flex items-center">
              {t('redirectingToServer')} {countdown} {countdown === 1 ? t('second') : t('seconds')}
              <ReloadIcon className="animate-spin ml-1" />
            </div>
          )}
        </div>
        
        <div className="flex md:flex-row flex-col p-6">
          <div className="md:w-1/3 mb-4 md:mb-0">
            <div className="mb-2">
              <span>{t('ipOrDomainPort')}</span>
            </div>
          </div>
          
          <div className="md:w-2/3 flex flex-col">
            <input
              className="p-2 bg-gray-100 text-black mb-4 rounded"
              placeholder="127.0.0.1:27015"
              type="text"
              name="host"
              value={formData.host}
              onChange={handleInputChange}
            />
            
            <button
              onClick={handleAddServer}
              className="py-2 px-4 bg-amber-400 text-black font-bold uppercase rounded hover:bg-amber-500 transition-colors w-36"
            >
              {isLoading ? (
                <ReloadIcon className="animate-spin mx-auto" />
              ) : (
                t('addServer')
              )}
            </button>
          </div>
        </div>
        
        {responseStatus && (
          <div className={`text-center pb-10 font-semibold ${responseColor ? 'text-green-500' : 'text-red-500'}`}>
            {responseStatus}
          </div>
        )}
      </div>
    </main>
  );
}