'use client'

import React from "react";
import Container from "@/components/container/Container";
import Link from "next/link";
import {get} from "@/utils/request";
import styles from './page.module.css'
import {Resource} from '@/types/resources'
import ResourceList from '@/components/list/ResourceList'

export default async function Repositorio() {
    const request = await get('/resources?pageSize=5&desc=true')
    const resources = Array.isArray(request.response.data?.resources) ? request.response.data.resources as Resource[] : [];
    const hasMore = !!request.response.data?.hasMore;
    const lastResource = request.response.data?.lastResource ?? null;

    return (
        <>
            <Container id={'ultimas'} crumb={['Repositorio',
                <Link key={'Últimas adiciones'} href={'#ultimas'}>Últimas adiciones</Link>]}>
                <h1 className={styles['title']}>Últimas adiciones</h1>

                <ResourceList
                    initialResources={resources}
                    initialHasMore={hasMore}
                    initialLastResource={lastResource}
                    baseEndpoint={'/resources'}
                    initialQuery={'?pageSize=5&desc=true'}
                />

                {hasMore && (
                    <Link href={'/repositorio'} className={styles['see-more']}>
                        Ver más
                    </Link>
                )}
            </Container>
        </>
    )
}