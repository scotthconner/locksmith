import Locksmith from '../services/Locksmith.js';
import { useQuery } from 'react-query';
import { useCacheKey } from './LocksmithHooks.js';
import {
  useNetwork,
  useProvider,
  useContract,
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi';
import {ethers} from 'ethers';

/**
 * useAlarm
 *
 * Given an event hash, will grab the alarm metadata.
 */
export function useAlarm(eventHash) {
  const provider = useProvider();
  const AlarmClock = useContract(Locksmith.getContract('AlarmClock', provider));
  return useQuery(useCacheKey('alarms for ' + eventHash), async function() {
    var response = await AlarmClock.alarms(eventHash);
    return {
      eventHash: response[0],
      alarmTime: response[1],
      snoozeInterval: response[2],
      snoozeKeyId: response[3]
    };
  });
}

/**
 * useCreateAlarm 
 *
 * Will call #createAlarm on the contract.
 */
export function useCreateAlarm(rootKeyId, description, alarmTime, snoozeInterval, snoozeKeyId, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('AlarmClock', 'createAlarm',
      [rootKeyId, ethers.utils.formatBytes32String(description||''), alarmTime, snoozeInterval, snoozeKeyId],
      rootKeyId !== null && description.length > 3 && snoozeInterval !== null && snoozeKeyId !== null && alarmTime !== null
    )
  );

  return useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });
}

/**
 * useChallengeAlarm
 *
 * Will call #challengeAlarm on the contract.
 */
export function useChallengeAlarm(eventHash, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('AlarmClock', 'challengeAlarm',
      [eventHash], eventHash !== null
    )
  );

  return useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });
}

/**
 * useSnoozeAlarm
 *
 * Will call #snoozeAlarm on the contract.
 */
export function useSnoozeAlarm(eventHash, snoozeKeyId, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('AlarmClock', 'snoozeAlarm',
      [eventHash, snoozeKeyId], eventHash !== null && snoozeKeyId !== null
    )
  );

  return useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });
}
