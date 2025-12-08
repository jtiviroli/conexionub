'use client'

import React from "react";
import Container from "@/components/container/Container";
import Link from "next/link";
import {get} from "@/utils/request";

import styles from '../page.module.css';
import ResourcesList from './resourcelist';
import {Resource} from "@/types/resources";

interface Props {
    searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function ResourcesPage({searchParams}: Props) {
    const authorParam = Array.isArray(searchParams?.author) ? searchParams?.author[0] : (searchParams?.author as string | undefined);
    const authorName = authorParam && String(authorParam).trim().length > 0 ? String(authorParam) : '';

    const pageSize = 10;
    const desc = true;

    const qs = `?pageSize=${pageSize}&desc=${desc}` + (authorName ? `&author=${encodeURIComponent(authorName)}` : '');
    const endpoint = `/resources${qs}`;
    const request = await get(endpoint);

    const raw = request.response.data || {};
    const resourcesRaw: Resource[] = Array.isArray(raw.resources) ? raw.resources as Resource[] : [];
    const hasMore: boolean = !!raw.hasMore;
    const lastResource: string | null = raw.lastResource ?? null;

    return (
        <Container id={'recursos'} crumb={[<Link key={'Repositorio'} href={'/repositorio'}>Repositorio</Link>,
            <Link key={'Recursos'} href={'/repositorio/recursos'}>Recursos</Link>,
            authorName ? <Link key={'author'} href={'#recursos'}>Recursos de {authorName}</Link> : null
        ]}>
            <h1 className={styles['title']}>{authorName ? `Recursos de ${authorName}` : 'Recursos'}</h1>

            <ResourcesList
                initialResources={resourcesRaw}
                initialHasMore={hasMore}
                initialLastResource={lastResource}
                authorName={authorName}
                pageSize={pageSize}
                desc={desc}
            />
        </Container>
    )
}
