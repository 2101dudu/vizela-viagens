'use client';

import { useState, useEffect, useCallback } from 'react';

export default function useFetchProductServices(token: string): any {
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isDone, setIsDone] = useState<boolean>(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`http://192.168.1.120:8080/api/dynamic/product/available-services/status?id=${token}`);

            if (!res.ok) {
                throw new Error(`Failed to fetch product: ${res.status}`);
            }

            const product = await res.json();

            if (!product) {
                throw new Error("Product not found");
            }

            if (product.status === "done" || product.isDone === true) {
                setData(product);
                setIsDone(true);
                setLoading(false);
                return true;
            }

            setData(product);
            return false;

        } catch (err) {
            console.error("Error fetching product services:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            setLoading(false);
            return true;
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;

        setLoading(true);
        setError(null);
        setIsDone(false);
        setData(null);

        let intervalId: NodeJS.Timeout;
        let timeoutId: NodeJS.Timeout;

        const startPolling = async () => {
            const shouldStop = await fetchData();

            if (shouldStop) {
                clearTimeout(timeoutId);
            } else {
                intervalId = setInterval(async () => {
                    const shouldStop = await fetchData();
                    if (shouldStop) {
                        clearInterval(intervalId);
                        clearTimeout(timeoutId);
                    }
                }, 1000);
            }
        };

        // Start 30s timeout timer
        timeoutId = setTimeout(() => {
            setError("Timed out after 30 seconds");
            setLoading(false);
            clearInterval(intervalId);
        }, 60000);

        startPolling();

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        isDone
    };
}
